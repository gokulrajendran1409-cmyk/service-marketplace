const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { broadcast } = require('../utils/sseClients');
const { notifyPro } = require('../utils/proSseClients');
const { notifyCustomer } = require('../utils/customerSseClients');
const { checkAndSend1HourReminders } = require('../services/reminderService');

const JOURNEY_STEPS = ['accepted', 'start_navigation', 'on_the_way', 'arrived', 'working'];

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

async function geocodeProfessionalAddress(address, city, state, pincode) {
    const query = [address, city, state, pincode].filter(Boolean).join(', ');
    if (!query) return { latitude: null, longitude: null };

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(query)}`, {
            headers: { 'User-Agent': 'service-marketplace/1.0' }
        });
        if (!response.ok) return { latitude: null, longitude: null };
        const results = await response.json();
        return results[0]
            ? { latitude: Number(results[0].lat), longitude: Number(results[0].lon) }
            : { latitude: null, longitude: null };
    } catch {
        return { latitude: null, longitude: null };
    }
}

exports.registerProfessional = async (req, res) => {
    try {
        const {
            email,
            password,
            full_name
        } = req.body;

        if (!full_name?.trim() || !email?.trim() || !password) {
            return res.status(400).json({ message: 'First name, last name, email, and password are required' });
        }

        const profilePhoto = req.files?.profile_photo?.[0]?.filename || req.file?.filename || null;

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const existing = await client.query(
                'SELECT id FROM users WHERE email = $1',
                [email.trim().toLowerCase()]
            );
            if (existing.rows.length) {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: 'An account with this email or phone already exists' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const userRes = await client.query(
                'INSERT INTO users (name, email, phone, password_hash, profile_photo) VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, profile_photo',
                [full_name.trim(), email.trim().toLowerCase(), null, passwordHash, profilePhoto ? `/uploads/${profilePhoto}` : null]
            );
            const user = userRes.rows[0];

            // Insert into professionals
            const profQuery = `
            INSERT INTO professionals (
                user_id, full_name, experience_years, password_hash, verification_status, profile_photo
            ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, profile_photo
        `;
        const profValues = [
            user.id,
            full_name,
            0,
            passwordHash,
            'incomplete',
            profilePhoto
        ];
        
        const profResult = await client.query(profQuery, profValues);
        const professionalId = profResult.rows[0].id;

            await client.query('COMMIT');

            res.status(201).json({
                message: 'Registration successful. Please log in to set up your profile.',
                professional: { 
                    id: professionalId, 
                    full_name, 
                    email: user.email, 
                    verification_status: 'incomplete',
                    profile_photo: profilePhoto 
                }
            });
        } catch (err) {
            await client.query('ROLLBACK');
            throw err;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('Registration Error:', err);
        res.status(500).json({ message: 'Server error during registration', error: err.message });
    }
};

exports.loginProfessional = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Email and password are required' });

        const result = await db.query(`
            SELECT u.id AS user_id, u.name, u.email, p.password_hash, p.id AS professional_id,
                     p.full_name, p.verification_status, p.rejection_reason, p.profile_photo, p.is_online
            FROM users u
            JOIN professionals p ON p.user_id = u.id
            WHERE u.email = $1
        `, [email.trim().toLowerCase()]);
        const professional = result.rows[0];
        if (!professional || !(await bcrypt.compare(password, professional.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        // Close any existing active login sessions for this professional
        await db.query(
            `UPDATE professional_logins 
             SET is_active = FALSE, logout_time = CURRENT_TIMESTAMP 
             WHERE professional_id = $1 AND is_active = TRUE`,
            [professional.professional_id]
        );

        // Record the new login event in the database
        const ipAddress = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').toString().split(',')[0].trim() || null;
        const userAgent = req.headers['user-agent'] || null;
        await db.query(
            `INSERT INTO professional_logins (professional_id, user_id, login_time, ip_address, user_agent, is_active)
             VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, TRUE)`,
            [professional.professional_id, professional.user_id, ipAddress, userAgent]
        );

        // Automatically mark the professional active (online) upon logging in
        await db.query(
            'UPDATE professionals SET is_online = TRUE WHERE id = $1',
            [professional.professional_id]
        );

        const token = jwt.sign({ id: professional.user_id, professionalId: professional.professional_id, role: 'professional' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Logged in successfully',
            token,
            professional: {
                id: professional.professional_id,
                full_name: professional.full_name,
                email: professional.email,
                verification_status: professional.verification_status,
                profile_photo: professional.profile_photo,
                is_online: true
            }
        });
    } catch (err) {
        console.error('Professional login error:', err);
        res.status(500).json({ message: 'Failed to log in' });
    }
};

exports.setupProfile = async (req, res) => {
    const professionalId = req.professionalId;
    const {
        full_name,
        phone,
        date_of_birth,
        address,
        pincode,
        bio,
        category,
        sub_category,
        experience_years,
        transport_mode,
        identity_type
    } = req.body;
    const profilePhoto = req.files?.profile_photo?.[0]?.filename;
    const identityPhoto = req.files?.identity_photo?.[0]?.filename;

    const phoneValue = phone?.trim() || '';
    const addressValue = address?.trim() || '';
    const pincodeValue = pincode?.trim() || '';
    const birthDate = date_of_birth ? new Date(`${date_of_birth}T00:00:00`) : null;
    const validPhone = /^\+?[0-9\s-]{7,15}$/.test(phoneValue);
    const validBirthDate = birthDate && !Number.isNaN(birthDate.getTime()) && birthDate <= new Date();

    if (!full_name?.trim() || !validPhone || !validBirthDate || addressValue.length < 5 || !/^\d{6}$/.test(pincodeValue) || !category || !experience_years || !identity_type) {
        return res.status(400).json({ message: 'Please complete all required profile details' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        const userResult = await client.query(
            `UPDATE users
             SET phone = $1
             WHERE id = (SELECT user_id FROM professionals WHERE id = $2)
             RETURNING id`,
            [phoneValue, professionalId]
        );

        if (!userResult.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Professional account not found' });
        }

        const result = await client.query(
            `UPDATE professionals
             SET full_name = $1,
                 date_of_birth = $2,
                 address = $3,
                 pincode = $4,
                 bio = $5,
                 category = $6,
                 sub_category = $7,
                 experience_years = $8,
                 transport_mode = $9,
                 identity_type = $10,
                 profile_photo = COALESCE($11, profile_photo),
                 identity_photo = COALESCE($12, identity_photo),
                 verification_status = CASE WHEN verification_status = 'verified' THEN 'verified' ELSE 'pending' END
             WHERE id = $13
             RETURNING id, user_id, full_name, date_of_birth, address, pincode, bio,
                       category, sub_category, experience_years, transport_mode,
                       identity_type, profile_photo, identity_photo, verification_status,
                       (SELECT email FROM users WHERE id = professionals.user_id) as email`,
            [
                full_name.trim(),
                date_of_birth,
                addressValue,
                pincodeValue,
                bio?.trim() || null,
                category,
                sub_category || null,
                Number(experience_years),
                transport_mode || null,
                identity_type,
                profilePhoto || null,
                identityPhoto || null,
                professionalId
            ]
        );

        if (!result.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Professional profile not found' });
        }

        await client.query('COMMIT');

        // Notify admin panel in real-time that profile is setup and ready for review
        broadcast('new_registration', {
            id: professionalId,
            full_name: full_name.trim(),
            category: category,
            timestamp: new Date().toISOString()
        });

        res.json({ message: 'Profile setup completed successfully', professional: { ...result.rows[0], phone: phoneValue } });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Profile setup error:', error);
        res.status(500).json({ message: 'Failed to setup profile' });
    } finally {
        client.release();
    }
};

exports.getProfessionalProfile = async (req, res) => {
    try {
        const result = await db.query(
                `SELECT p.id, p.full_name, p.date_of_birth, p.address, p.pincode, p.bio,
                    p.category, p.sub_category, p.experience_years,
                    p.transport_mode, p.identity_type, p.profile_photo, p.identity_photo,
                    p.verification_status, p.is_online, u.phone, u.email
                 FROM professionals p
                 JOIN users u ON u.id = p.user_id
                 WHERE p.id = $1`,
            [req.professionalId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Professional profile not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Fetch professional profile error:', error);
        res.status(500).json({ message: 'Failed to fetch professional profile' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        
        // Count offers made by this professional for their stats
        const statsQuery = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(*) FILTER (WHERE so.status = 'pending' AND COALESCE(p.is_online, false) = true) as pending_requests,
                COUNT(*) FILTER (WHERE so.status = 'accepted' AND sr.status = 'completed') as completed_requests
            FROM service_offers so
            JOIN service_requests sr ON sr.id = so.request_id
            JOIN professionals p ON p.id = so.professional_id
            WHERE so.professional_id = $1
              AND (COALESCE(p.is_online, false) = true OR so.status != 'pending')
        `;
        
        const reviewQuery = `
            SELECT
                COALESCE(ROUND(AVG(rating)::numeric, 1), 0) AS avg_rating,
                COUNT(*)::int AS review_count
            FROM professional_reviews
            WHERE professional_id = $1
        `;

        const profileQuery = `
            SELECT category, experience_years, identity_type, identity_photo
            FROM professionals
            WHERE id = $1
        `;

        const [statsResult, reviewResult, profileResult] = await Promise.all([
            db.query(statsQuery, [professionalId]),
            db.query(reviewQuery, [professionalId]),
            db.query(profileQuery, [professionalId])
        ]);
        const row = statsResult.rows[0];
        const reviews = reviewResult.rows[0];
        const profile = profileResult.rows[0];
        
        const stats = {
            total_requests: parseInt(row.total_requests || 0),
            pending_requests: parseInt(row.pending_requests || 0),
            completed_requests: parseInt(row.completed_requests || 0),
            total_earnings: parseInt(row.completed_requests || 0) * 500,
            avg_rating: parseFloat(reviews.avg_rating || 0),
            review_count: parseInt(reviews.review_count || 0),
            profile_setup_completed: Boolean(
                profile?.category &&
                profile?.experience_years != null &&
                profile?.identity_type &&
                profile?.identity_photo
            )
        };
        
        res.json(stats);
    } catch (err) {
        console.error('Dashboard Stats Error:', err);
        res.status(500).json({ message: 'Failed to fetch dashboard stats' });
    }
};

exports.getMyRequests = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        
        // Get service requests where this professional has made an offer
        // When offline, do NOT return pending available job requests.
        const query = `
            SELECT 
                sr.*, 
                sr.updated_at AS work_completed_at,
                u.name as customer_name, 
                u.phone as customer_phone,
                so.status as offer_status
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            JOIN service_offers so ON sr.id = so.request_id
            JOIN professionals p ON p.id = so.professional_id
            WHERE so.professional_id = $1
              AND (COALESCE(p.is_online, false) = true OR so.status != 'pending')
            ORDER BY sr.created_at DESC
        `;
        
        const result = await db.query(query, [professionalId]);
        res.json(result.rows);
    } catch (err) {
        console.error('Fetch Requests Error:', err);
        res.status(500).json({ message: 'Failed to fetch requests' });
    }
};

exports.respondToRequest = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);
    const { decision, professional_latitude, professional_longitude } = req.body;

    if (!Number.isInteger(requestId) || !['accepted', 'rejected'].includes(decision)) {
        return res.status(400).json({ message: 'A valid request and decision are required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const offer = await client.query(
            `SELECT so.id, sr.id AS request_id, sr.status AS request_status
             FROM service_offers so
             JOIN service_requests sr ON sr.id = so.request_id
             WHERE so.request_id = $1 AND so.professional_id = $2 AND so.status = 'pending'
             FOR UPDATE OF so, sr`,
            [requestId, professionalId]
        );
        if (!offer.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'No pending request was found for this professional' });
        }

        if (offer.rows[0].request_status !== 'pending') {
            await client.query('UPDATE service_offers SET status = \'rejected\', updated_at = CURRENT_TIMESTAMP WHERE id = $1', [offer.rows[0].id]);
            await client.query('COMMIT');
            return res.status(409).json({ message: 'This request was already accepted by another professional.' });
        }

        await client.query('UPDATE service_offers SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2', [decision, offer.rows[0].id]);
        if (decision === 'accepted' && Number.isFinite(Number(professional_latitude)) && Number.isFinite(Number(professional_longitude))) {
            await client.query(
                `UPDATE professionals
                 SET current_latitude = $1, current_longitude = $2, location_updated_at = CURRENT_TIMESTAMP
                 WHERE id = $3`,
                [professional_latitude, professional_longitude, professionalId]
            );
        }
        let requestStatus = decision;
        if (decision === 'rejected') {
            const remainingOffers = await client.query(
                `SELECT COUNT(*)::int AS count
                 FROM service_offers
                 WHERE request_id = $1 AND status = 'pending'`,
                [requestId]
            );
            requestStatus = remainingOffers.rows[0].count > 0 ? 'pending' : 'cancelled';
        }
        const requestResult = await client.query(
            'UPDATE service_requests SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
            [requestStatus, requestId]
        );
        if (decision === 'accepted') {
            const competingOffers = await client.query(
                `SELECT professional_id FROM service_offers
                 WHERE request_id = $1 AND professional_id <> $2 AND status = 'pending'`,
                [requestId, professionalId]
            );
            await client.query(
                `UPDATE service_offers
                 SET status = 'rejected', updated_at = CURRENT_TIMESTAMP
                 WHERE request_id = $1 AND professional_id <> $2 AND status = 'pending'`,
                [requestId, professionalId]
            );
            competingOffers.rows.forEach(({ professional_id }) => notifyPro(Number(professional_id), 'request_taken', {
                request_id: requestId,
                message: 'This request was already accepted by another professional.',
                timestamp: new Date().toISOString()
            }));

            // Fetch professional details to notify customer in real-time
            const proInfoResult = await client.query(
                `SELECT p.id, p.full_name, p.category, p.profile_photo, u.phone,
                        (SELECT ROUND(AVG(pr.rating)::numeric, 1) FROM professional_reviews pr WHERE pr.professional_id = p.id) AS avg_rating,
                        (SELECT COUNT(*) FROM professional_reviews pr WHERE pr.professional_id = p.id) AS review_count
                 FROM professionals p
                 LEFT JOIN users u ON u.id = p.user_id
                 WHERE p.id = $1`,
                [professionalId]
            );
            const pro = proInfoResult.rows[0] || {};
            const customerId = requestResult.rows[0].customer_id;

            notifyCustomer(customerId, 'requestAccepted', {
                id: `notif_${requestId}_accepted`,
                type: 'request_accepted',
                request_id: requestId,
                title: 'Service Accepted!',
                message: `${pro.full_name || 'Your professional'} has accepted your ${requestResult.rows[0].title || 'service'} request!`,
                metadata: {
                    requestId: requestId,
                    professionalName: pro.full_name || 'Specialist',
                    professionalPhone: pro.phone || '+919876543210',
                    professionalCategory: pro.category || 'Certified Expert',
                    professionalPhoto: pro.profile_photo || null,
                    rating: Number(pro.avg_rating) || 4.9,
                    reviewCount: Number(pro.review_count) || 12,
                    serviceTitle: requestResult.rows[0].title,
                    location: requestResult.rows[0].location,
                    requestedAt: requestResult.rows[0].requested_at
                },
                timestamp: new Date().toISOString()
            });

            notifyCustomer(customerId, 'requestUpdate', {
                requestId: requestId,
                newStatus: 'accepted',
                journeyStatus: 'accepted',
                updateType: 'service_accepted',
                professionalName: pro.full_name || 'Specialist',
                message: `${pro.full_name || 'Your professional'} has accepted your ${requestResult.rows[0].title || 'service'} request!`
            });
        }
        await client.query('COMMIT');

        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: decision,
            timestamp: new Date().toISOString()
        });
        res.json({ message: `Request ${decision}`, request: requestResult.rows[0] });

        if (decision === 'accepted') {
            checkAndSend1HourReminders().catch(e => console.error('Reminder check error on accept:', e.message));
        }
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Request response error:', error);
        res.status(500).json({ message: 'Failed to update the request' });
    } finally {
        client.release();
    }
};

exports.updateRequestJourney = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);
    const { journey_status: nextStatus } = req.body;

    if (!Number.isInteger(requestId) || !JOURNEY_STEPS.includes(nextStatus) || nextStatus === 'accepted') {
        return res.status(400).json({ message: 'A valid next journey step is required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const current = await client.query(
            `SELECT sr.journey_status, sr.customer_id, p.full_name as professional_name
             FROM service_requests sr
             JOIN service_offers so ON so.request_id = sr.id
             JOIN professionals p ON p.id = so.professional_id
             WHERE sr.id = $1 AND so.professional_id = $2 AND so.status = 'accepted'
             FOR UPDATE`,
            [requestId, professionalId]
        );
        if (!current.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Accepted request not found for this professional' });
        }

        const customerId = current.rows[0].customer_id;
        const professionalName = current.rows[0].professional_name;
        const currentIndex = JOURNEY_STEPS.indexOf(current.rows[0].journey_status || 'accepted');
        const nextIndex = JOURNEY_STEPS.indexOf(nextStatus);
        if (nextIndex !== currentIndex + 1) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Please complete the journey steps in order' });
        }

        const requestStatus = nextStatus === 'completed' ? 'completed' : 'in_progress';
        
        let otpQuery = '';
        let otpParams = [nextStatus, requestStatus, requestId];
        let otp = null;

        if (nextStatus === 'start_navigation') {
            otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit OTP
            otpQuery = ', otp = $4';
            otpParams.push(otp);
        }

        const result = await client.query(
            `UPDATE service_requests
             SET journey_status = $1, journey_updated_at = CURRENT_TIMESTAMP, status = $2, updated_at = CURRENT_TIMESTAMP ${otpQuery}
             WHERE id = $3
             RETURNING *`,
            otpParams
        );
        await client.query('COMMIT');

        // Notify customer about the update
        notifyCustomer(customerId, 'requestUpdate', {
            requestId: requestId,
            newStatus: requestStatus,
            journeyStatus: nextStatus,
            updateType: 'journey_update',
            professionalName: professionalName
        });

        // Also broadcast to admin
        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: requestStatus,
            journey_status: nextStatus,
            timestamp: new Date().toISOString()
        });
        res.json({ message: `Journey updated to ${nextStatus}`, request: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Request journey error:', error);
        res.status(500).json({ message: 'Failed to update request journey' });
    } finally {
        client.release();
    }
};

exports.verifyOtp = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);
    const { otp } = req.body;

    if (!Number.isInteger(requestId) || !otp || otp.length !== 6) {
        return res.status(400).json({ message: 'A valid 6-digit OTP is required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const current = await client.query(
            `SELECT sr.journey_status, sr.otp, sr.customer_id, p.full_name as professional_name
             FROM service_requests sr
             JOIN service_offers so ON so.request_id = sr.id
             JOIN professionals p ON p.id = so.professional_id
             WHERE sr.id = $1 AND so.professional_id = $2 AND so.status = 'accepted'
             FOR UPDATE`,
            [requestId, professionalId]
        );
        
        if (!current.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Request not found for this professional' });
        }

        if (current.rows[0].otp !== otp) {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        const customerId = current.rows[0].customer_id;
        const professionalName = current.rows[0].professional_name;

        const result = await client.query(
            `UPDATE service_requests
             SET journey_status = 'arrived',
                 is_otp_verified = TRUE,
                 otp_verified_at = CURRENT_TIMESTAMP,
                 journey_updated_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [requestId]
        );
        await client.query('COMMIT');

        // Notify customer about arrival and OTP verification
        notifyCustomer(customerId, 'requestUpdate', {
            requestId: requestId,
            newStatus: 'in_progress',
            journeyStatus: 'arrived',
            is_otp_verified: true,
            updateType: 'journey_update',
            professionalName: professionalName
        });

        // Also broadcast to admin
        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: 'in_progress',
            journey_status: 'arrived',
            is_otp_verified: true,
            timestamp: new Date().toISOString()
        });
        res.json({ message: 'OTP verified successfully, status updated to arrived', request: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('OTP verification error:', error);
        res.status(500).json({ message: 'Failed to verify OTP' });
    } finally {
        client.release();
    }
};

exports.updateLocation = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);
    const { latitude, longitude } = req.body;

    if (!Number.isInteger(requestId) || latitude == null || longitude == null) {
        return res.status(400).json({ message: 'Request ID and location are required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        
        // Ensure this professional actually owns the accepted/in-progress request
        const offer = await client.query(
            `SELECT sr.customer_id, sr.latitude, sr.longitude, sr.otp, sr.title, p.full_name as professional_name
             FROM service_offers so
             JOIN service_requests sr ON sr.id = so.request_id
             JOIN professionals p ON p.id = so.professional_id
             WHERE so.request_id = $1 AND so.professional_id = $2 AND so.status = 'accepted'`,
            [requestId, professionalId]
        );
        
        if (!offer.rows.length) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Not authorized for this request' });
        }

        const customerId = offer.rows[0].customer_id;
        const custLat = Number(offer.rows[0].latitude);
        const custLon = Number(offer.rows[0].longitude);

        let distanceMeters = null;
        let isNearby = false;
        if (Number.isFinite(custLat) && Number.isFinite(custLon) && Number.isFinite(Number(latitude)) && Number.isFinite(Number(longitude))) {
            const dLat = (Number(latitude) - custLat) * Math.PI / 180;
            const dLon = (Number(longitude) - custLon) * Math.PI / 180;
            const a = Math.sin(dLat / 2) ** 2 + Math.cos(custLat * Math.PI / 180) * Math.cos(Number(latitude) * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
            const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            distanceMeters = Math.round(6371000 * c);
            isNearby = distanceMeters <= 500;
        }

        // Update professional's current location
        await client.query(
            `UPDATE professionals
             SET current_latitude = $1, current_longitude = $2, location_updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [latitude, longitude, professionalId]
        );

        await client.query('COMMIT');

        // Notify the specific customer in real-time
        const { notifyCustomer } = require('../utils/customerSseClients');
        notifyCustomer(customerId, 'location_update', {
            request_id: requestId,
            professional_latitude: latitude,
            professional_longitude: longitude,
            distance_meters: distanceMeters,
            is_nearby: isNearby,
            professional_name: offer.rows[0].professional_name,
            otp: offer.rows[0].otp,
            timestamp: new Date().toISOString()
        });

        if (isNearby) {
            notifyCustomer(customerId, 'nearby_arrival', {
                request_id: requestId,
                distance_meters: distanceMeters,
                professional_name: offer.rows[0].professional_name,
                otp: offer.rows[0].otp,
                title: 'Professional Arriving Nearby! 📍',
                message: `${offer.rows[0].professional_name || 'Your professional'} is arriving nearby (within ${distanceMeters}m). Arrival OTP: ${offer.rows[0].otp || '****'}.`,
                timestamp: new Date().toISOString()
            });
        }

        res.json({ message: 'Location updated successfully' });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Update location error:', error);
        res.status(500).json({ message: 'Failed to update location' });
    } finally {
        client.release();
    }
};

exports.submitWage = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);
    const { wage, wage_description } = req.body;

    const wageText = typeof wage === 'string' ? wage.trim() : String(wage ?? '');
    const wageAmount = Number(wageText);
    if (!Number.isInteger(requestId) || !/^\d+(\.\d{1,2})?$/.test(wageText) || !Number.isFinite(wageAmount) || wageAmount <= 0) {
        return res.status(400).json({ message: 'A valid wage amount with up to 2 decimal places is required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');

        // Verify this professional owns the accepted request and it's in 'working' journey state
        const current = await client.query(
            `SELECT sr.journey_status, sr.status, sr.customer_id, p.full_name as professional_name
             FROM service_requests sr
             JOIN service_offers so ON so.request_id = sr.id
             JOIN professionals p ON p.id = so.professional_id
             WHERE sr.id = $1 AND so.professional_id = $2 AND so.status = 'accepted'
             FOR UPDATE`,
            [requestId, professionalId]
        );

        if (!current.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Accepted request not found for this professional' });
        }

        const { journey_status } = current.rows[0];
        const customerId = current.rows[0].customer_id;
        const professionalName = current.rows[0].professional_name;
        
        if (journey_status !== 'working') {
            await client.query('ROLLBACK');
            return res.status(400).json({ message: 'Wage can only be submitted after the work is in progress (working status)' });
        }

        const result = await client.query(
            `UPDATE service_requests
             SET journey_status = 'awaiting_payment',
                 status = 'in_progress',
                 payment_status = 'awaiting_payment',
                 wage = $1,
                 wage_description = $2,
                 journey_updated_at = CURRENT_TIMESTAMP,
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $3
             RETURNING *`,
            [wageAmount, wage_description || null, requestId]
        );

        await client.query('COMMIT');

        // Notify customer that payment is ready
        notifyCustomer(customerId, 'requestUpdate', {
            requestId: requestId,
            newStatus: 'in_progress',
            journeyStatus: 'awaiting_payment',
            updateType: 'payment_ready',
            professionalName: professionalName
        });

        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: 'in_progress',
            journey_status: 'awaiting_payment',
            payment_status: 'awaiting_payment',
            timestamp: new Date().toISOString()
        });

        res.json({ message: 'Wage submitted, awaiting customer payment confirmation', request: result.rows[0] });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Submit wage error:', error);
        res.status(500).json({ message: 'Failed to submit wage' });
    } finally {
        client.release();
    }
};

exports.updateCurrentLocation = async (req, res) => {
    const professionalId = req.professionalId;
    const lat = Number(req.body.latitude);
    const lng = Number(req.body.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return res.status(400).json({ message: 'Valid latitude and longitude are required' });
    }

    try {
        await db.query(
            `UPDATE professionals
             SET current_latitude = $1, current_longitude = $2, location_updated_at = CURRENT_TIMESTAMP
             WHERE id = $3`,
            [lat, lng, professionalId]
        );

        res.json({ message: 'Current location updated successfully', latitude: lat, longitude: lng });
    } catch (error) {
        console.error('Update current location error:', error);
        res.status(500).json({ message: 'Failed to update current location' });
    }
};

exports.getEarnings = async (req, res) => {
    const professionalId = req.professionalId;
    const { period = 'month' } = req.query;
    const dateFilter = {
        week: `AND sr.updated_at >= NOW() - INTERVAL '7 days'`,
        month: `AND sr.updated_at >= NOW() - INTERVAL '30 days'`,
        year: `AND sr.updated_at >= NOW() - INTERVAL '1 year'`
    }[period] || '';

    try {
        const summaryQuery = `
            SELECT
                COUNT(*) FILTER (WHERE sr.payment_status = 'paid') AS paid_jobs,
                COALESCE(SUM(sr.wage) FILTER (WHERE sr.payment_status = 'paid'), 0) AS period_earnings,
                COUNT(*) FILTER (WHERE sr.payment_status = 'awaiting_payment') AS pending_jobs,
                COALESCE(SUM(sr.wage) FILTER (WHERE sr.payment_status = 'awaiting_payment'), 0) AS pending_earnings
            FROM service_requests sr
            JOIN service_offers so ON sr.id = so.request_id
            WHERE so.professional_id = $1 ${dateFilter}`;
        const jobsQuery = `
            SELECT sr.id, u.name AS customer_name, sr.title, sr.wage, sr.payment_status,
                   sr.updated_at AS paid_at
            FROM service_requests sr
            JOIN service_offers so ON sr.id = so.request_id
            JOIN users u ON sr.customer_id = u.id
            WHERE so.professional_id = $1
              AND sr.payment_status IN ('paid', 'awaiting_payment') ${dateFilter}
            ORDER BY sr.updated_at DESC LIMIT 50`;

        const [summaryResult, jobsResult] = await Promise.all([
            db.query(summaryQuery, [professionalId]),
            db.query(jobsQuery, [professionalId])
        ]);
        const summary = summaryResult.rows[0];
        res.json({
            period,
            paid_jobs: Number(summary.paid_jobs || 0),
            period_earnings: Number(summary.period_earnings || 0),
            pending_jobs: Number(summary.pending_jobs || 0),
            pending_earnings: Number(summary.pending_earnings || 0),
            jobs: jobsResult.rows
        });
    } catch (error) {
        console.error('Earnings error:', error);
        res.status(500).json({ message: 'Failed to fetch earnings' });
    }
};

exports.getReviews = async (req, res) => {
    try {
        const result = await db.query(
            `SELECT pr.id, pr.rating, pr.comment, pr.created_at,
                    u.name AS customer_name, sr.title AS service_title
             FROM professional_reviews pr
             JOIN users u ON pr.customer_id = u.id
             JOIN service_requests sr ON pr.request_id = sr.id
             WHERE pr.professional_id = $1
             ORDER BY pr.created_at DESC`,
            [req.professionalId]
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Fetch reviews error:', error);
        res.status(500).json({ message: 'Failed to fetch reviews' });
    }
};

// POST /api/professionals/requests/:id/complete-task - Dedicated action for professional completing service
exports.completeTask = async (req, res) => {
    const professionalId = req.professionalId;
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
        return res.status(400).json({ message: 'A valid request ID is required' });
    }

    const client = await db.connect();
    try {
        await client.query('BEGIN');
        const offerCheck = await client.query(
            `SELECT sr.id, sr.title, sr.customer_id, sr.status, sr.payment_status, p.full_name as professional_name
             FROM service_requests sr
             JOIN service_offers so ON so.request_id = sr.id
             JOIN professionals p ON p.id = so.professional_id
             WHERE sr.id = $1 AND so.professional_id = $2 AND so.status = 'accepted'
             FOR UPDATE OF sr`,
            [requestId, professionalId]
        );

        if (!offerCheck.rows.length) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Accepted request not found for this professional' });
        }

        const request = offerCheck.rows[0];
        const customerId = request.customer_id;
        const professionalName = request.professional_name || 'Professional';
        const serviceTitle = request.title || 'Service';

        const updateResult = await client.query(
            `UPDATE service_requests
             SET status = 'completed',
                 journey_status = 'completed',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [requestId]
        );

        await client.query(
            `INSERT INTO notifications (user_id, request_id, professional_id, type, title, message, is_read, metadata, created_at)
             VALUES ($1, $2, $3, 'task_completed', 'Task Completed! 🎉', $4, false, $5, CURRENT_TIMESTAMP)
             ON CONFLICT (user_id, request_id, type) DO NOTHING`,
            [
                customerId,
                requestId,
                professionalId,
                `${professionalName} has completed your service "${serviceTitle}". Please rate your experience!`,
                JSON.stringify({ requestId, professionalName, serviceTitle })
            ]
        );

        await client.query('COMMIT');

        // Real-time SSE notification to the customer
        notifyCustomer(customerId, 'requestUpdate', {
            requestId: requestId,
            newStatus: 'completed',
            journeyStatus: 'completed',
            updateType: 'task_completed',
            professionalName: professionalName,
            serviceTitle: serviceTitle,
            message: `${professionalName} has completed the service: ${serviceTitle}!`,
            timestamp: new Date().toISOString()
        });

        // Also push to customer's general notification stream
        notifyCustomer(customerId, 'notification', {
            id: `notif_${requestId}_completed`,
            type: 'task_completed',
            request_id: requestId,
            title: 'Task Completed! 🎉',
            message: `${professionalName} has completed your service "${serviceTitle}". Please rate your experience!`,
            metadata: {
                requestId: requestId,
                professionalName: professionalName,
                serviceTitle: serviceTitle,
            },
            timestamp: new Date().toISOString()
        });

        // Broadcast to admin panel
        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: 'completed',
            journey_status: 'completed',
            timestamp: new Date().toISOString()
        });

        res.json({
            message: 'Task completed successfully! Customer has been notified in real time.',
            request: updateResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Complete task error:', error);
        res.status(500).json({ message: 'Failed to complete task' });
    } finally {
        client.release();
    }
};

exports.updateOnlineStatus = async (req, res) => {
    try {
        const { is_online } = req.body;
        const professionalId = req.professionalId;
        if (typeof is_online !== 'boolean') {
            return res.status(400).json({ message: 'is_online boolean field is required' });
        }

        const result = await db.query(
            `UPDATE professionals 
             SET is_online = $1 
             WHERE id = $2 
             RETURNING id, user_id, full_name, is_online`,
            [is_online, professionalId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Professional not found' });
        }

        const pro = result.rows[0];

        if (!is_online) {
            // When turning offline, close any active login sessions
            await db.query(
                `UPDATE professional_logins 
                 SET is_active = FALSE, logout_time = CURRENT_TIMESTAMP 
                 WHERE professional_id = $1 AND is_active = TRUE`,
                [professionalId]
            );
        } else {
            // When turning online, ensure there is an active session
            const activeSession = await db.query(
                'SELECT id FROM professional_logins WHERE professional_id = $1 AND is_active = TRUE LIMIT 1',
                [professionalId]
            );
            if (!activeSession.rows.length) {
                const ipAddress = (req.headers['x-forwarded-for'] || req.socket?.remoteAddress || req.ip || '').toString().split(',')[0].trim() || null;
                const userAgent = req.headers['user-agent'] || null;
                await db.query(
                    `INSERT INTO professional_logins (professional_id, user_id, login_time, ip_address, user_agent, is_active)
                     VALUES ($1, $2, CURRENT_TIMESTAMP, $3, $4, TRUE)`,
                    [professionalId, pro.user_id, ipAddress, userAgent]
                );
            }
        }

        res.json({
            message: `Professional is now ${is_online ? 'online' : 'offline'}`,
            professional: {
                id: pro.id,
                full_name: pro.full_name,
                is_online: pro.is_online
            }
        });
    } catch (error) {
        console.error('Update online status error:', error);
        res.status(500).json({ message: 'Failed to update online status' });
    }
};

exports.logoutProfessional = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        if (!professionalId) {
            return res.status(400).json({ message: 'Professional ID not found' });
        }

        // Set professional offline
        await db.query(
            'UPDATE professionals SET is_online = FALSE WHERE id = $1',
            [professionalId]
        );

        // Mark active login records as logged out
        await db.query(
            `UPDATE professional_logins 
             SET is_active = FALSE, logout_time = CURRENT_TIMESTAMP 
             WHERE professional_id = $1 AND is_active = TRUE`,
            [professionalId]
        );

        res.json({
            message: 'Logged out successfully',
            is_online: false
        });
    } catch (error) {
        console.error('Professional logout error:', error);
        res.status(500).json({ message: 'Failed to log out' });
    }
};

// GET /api/professionals/notifications - Get persistent notifications for logged in professional
exports.getNotifications = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        const userId = req.user.id;
        const result = await db.query(
            `SELECT id, request_id, professional_id, user_id, type, title, message, is_read, created_at, metadata
             FROM notifications
             WHERE professional_id = $1 OR (user_id = $2 AND type LIKE '%_pro%')
             ORDER BY created_at DESC
             LIMIT 50`,
            [professionalId, userId]
        );
        res.json({
            notifications: result.rows.map(n => ({
                id: n.id,
                type: n.type,
                request_id: n.request_id,
                title: n.title,
                message: n.message,
                timestamp: n.created_at,
                read: n.is_read,
                metadata: n.metadata
            })),
            unreadCount: result.rows.filter(n => !n.is_read).length
        });
    } catch (err) {
        console.error('getProfessionalNotifications error:', err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

// PATCH /api/professionals/notifications/:id/read - Mark notification as read
exports.markNotificationRead = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        const notifId = Number(req.params.id);
        if (Number.isInteger(notifId)) {
            await db.query(
                `UPDATE notifications SET is_read = true WHERE id = $1 AND (professional_id = $2 OR user_id = $3)`,
                [notifId, professionalId, req.user.id]
            );
        }
        res.json({ success: true });
    } catch (err) {
        console.error('markProfessionalNotificationRead error:', err);
        res.status(500).json({ message: 'Failed to mark notification read' });
    }
};


