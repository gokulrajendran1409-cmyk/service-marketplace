const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { broadcast } = require('../utils/sseClients');
const { notifyPro } = require('../utils/proSseClients');
const { notifyCustomer } = require('../utils/customerSseClients');
const { createJourneyNotification, createNotification, NOTIFICATION_TYPES } = require('../utils/notifications');

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
            phone,
            password,
            full_name,
            date_of_birth,
            address,
            city,
            state,
            pincode,
            bio,
            experience_years,
            category
        } = req.body;
        
        // Extract uploaded files
        let idProofPath = '';
        let certificatePath = '';

        if (req.files) {
            if (req.files.id_proof) idProofPath = req.files.id_proof[0].filename;
            if (req.files.certificate) certificatePath = req.files.certificate[0].filename;
        }

        if (!full_name || !email || !phone || !password || !category || !experience_years) {
            return res.status(400).json({ message: 'Please complete all required account and professional details' });
        }

        const registeredLocation = await geocodeProfessionalAddress(address, city, state, pincode);

        const client = await db.connect();
        try {
            await client.query('BEGIN');
            const existing = await client.query(
                'SELECT id FROM users WHERE email = $1 OR phone = $2',
                [email.trim().toLowerCase(), phone.trim()]
            );
            if (existing.rows.length) {
                await client.query('ROLLBACK');
                return res.status(409).json({ message: 'An account with this email or phone already exists' });
            }

            const passwordHash = await bcrypt.hash(password, 10);
            const userRes = await client.query(
                'INSERT INTO users (name, email, phone, password_hash) VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone',
                [full_name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash]
            );
            const user = userRes.rows[0];

        // Insert into professionals
            const profQuery = `
            INSERT INTO professionals (
                user_id, full_name, date_of_birth, address, city, state, pincode, bio, experience_years, category, password_hash, registered_latitude, registered_longitude
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) RETURNING id
        `;
        const profValues = [
            user.id,
            full_name,
            date_of_birth || null,
            address || null,
            city || null,
            state || null,
            pincode || null,
            bio || null,
            parseInt(experience_years) || 0,
            category || null,
            passwordHash,
            registeredLocation.latitude,
            registeredLocation.longitude
        ];
        
        profValues[0] = user.id;
        const profResult = await client.query(profQuery, profValues);
        const professionalId = profResult.rows[0].id;

        // Insert ID Proof Document
        if (idProofPath) {
            await client.query(`
                INSERT INTO professional_documents (professional_id, document_type, document_url) 
                VALUES ($1, $2, $3)
            `, [professionalId, 'id_proof', idProofPath]);
        }

        // Insert Certificate Document
        if (certificatePath) {
            await client.query(`
                INSERT INTO professional_documents (professional_id, document_type, document_url) 
                VALUES ($1, $2, $3)
            `, [professionalId, 'certification', certificatePath]);
        }

            await client.query('COMMIT');

        // Notify admin panel in real-time
        broadcast('new_registration', {
            id: professionalId,
            full_name,
            category: category || 'Uncategorized',
            timestamp: new Date().toISOString()
        });

            res.status(201).json({
                message: 'Registration successful. Your profile is pending verification.',
                professional: { id: professionalId, full_name, email: user.email, verification_status: 'pending' }
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
                     p.full_name, p.verification_status, p.rejection_reason
            FROM users u
            JOIN professionals p ON p.user_id = u.id
            WHERE u.email = $1
        `, [email.trim().toLowerCase()]);
        const professional = result.rows[0];
        if (!professional || !(await bcrypt.compare(password, professional.password_hash))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }
        if (professional.verification_status !== 'verified') {
            return res.status(403).json({
                status: professional.verification_status,
                message: professional.verification_status === 'rejected'
                    ? `Status: Rejected by admin. Reason: ${professional.rejection_reason || 'No reason was provided.'}`
                    : 'Your registration is pending admin approval. You can log in after approval.'
            });
        }

        const token = jwt.sign({ id: professional.user_id, professionalId: professional.professional_id, role: 'professional' }, JWT_SECRET, { expiresIn: '7d' });
        res.json({
            message: 'Logged in successfully',
            token,
            professional: {
                id: professional.professional_id,
                full_name: professional.full_name,
                email: professional.email,
                verification_status: professional.verification_status
            }
        });
    } catch (err) {
        console.error('Professional login error:', err);
        res.status(500).json({ message: 'Failed to log in' });
    }
};

exports.getDashboardStats = async (req, res) => {
    try {
        const professionalId = req.professionalId;
        
        // Count offers made by this professional for their stats
        const statsQuery = `
            SELECT 
                COUNT(*) as total_requests,
                COUNT(*) FILTER (WHERE so.status = 'pending') as pending_requests,
                COUNT(*) FILTER (WHERE so.status = 'accepted' AND sr.status = 'completed') as completed_requests
            FROM service_offers so
            JOIN service_requests sr ON sr.id = so.request_id
            WHERE so.professional_id = $1
        `;
        
        const result = await db.query(statsQuery, [professionalId]);
        const row = result.rows[0];
        
        const stats = {
            total_requests: parseInt(row.total_requests || 0),
            pending_requests: parseInt(row.pending_requests || 0),
            completed_requests: parseInt(row.completed_requests || 0),
            total_earnings: parseInt(row.completed_requests || 0) * 500 // Assuming 500 per completed job
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
        const query = `
            SELECT 
                sr.*, 
                u.name as customer_name, 
                u.phone as customer_phone,
                so.status as offer_status
            FROM service_requests sr
            JOIN users u ON sr.customer_id = u.id
            JOIN service_offers so ON sr.id = so.request_id
            WHERE so.professional_id = $1
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
        }
        await client.query('COMMIT');

        // Create persistent notification when professional accepts the request
        if (decision === 'accepted') {
            console.log(`[NOTIFICATION] Professional ${professionalId} accepted request ${requestId}, creating notification...`);
            const requestInfo = await db.query(
                `SELECT sr.customer_id, p.full_name as professional_name
                 FROM service_requests sr
                 JOIN professionals p ON p.id = $2
                 WHERE sr.id = $1`,
                [requestId, professionalId]
            );
            if (requestInfo.rows.length) {
                const { customer_id, professional_name } = requestInfo.rows[0];
                console.log(`[NOTIFICATION] Creating notification for customer ${customer_id}`);
                const notification = await createNotification({
                    userId: customer_id,
                    type: NOTIFICATION_TYPES.REQUEST_ACCEPTED,
                    title: 'Request Accepted',
                    message: `${professional_name} has accepted your service request.`,
                    requestId: requestId,
                    professionalId: professionalId,
                    metadata: { status: 'accepted' }
                });
                console.log(`[NOTIFICATION] Notification created:`, notification);

                // Notify customer in real-time
                notifyCustomer(customer_id, 'requestUpdate', {
                    requestId: requestId,
                    newStatus: 'accepted',
                    journeyStatus: 'accepted',
                    updateType: 'status_change',
                    professionalName: professional_name
                });
            } else {
                console.log(`[NOTIFICATION] No request info found for request ${requestId}`);
            }
        }

        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: decision,
            timestamp: new Date().toISOString()
        });
        res.json({ message: `Request ${decision}`, request: requestResult.rows[0] });
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

        // Create persistent notification for customer
        console.log(`[NOTIFICATION] Journey update to ${nextStatus} for request ${requestId}, creating notification for customer ${customerId}...`);
        const journeyNotification = await createJourneyNotification({
            userId: customerId,
            professionalName: professionalName,
            journeyStatus: nextStatus,
            requestId: requestId,
            professionalId: professionalId
        });
        console.log(`[NOTIFICATION] Journey notification created:`, journeyNotification);

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
             SET journey_status = 'arrived', journey_updated_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
             WHERE id = $1
             RETURNING *`,
            [requestId]
        );
        await client.query('COMMIT');

        // Create persistent notification for customer about arrival
        await createNotification({
            userId: customerId,
            type: NOTIFICATION_TYPES.ARRIVAL,
            title: 'Professional Has Arrived',
            message: `${professionalName} has arrived at your location.`,
            requestId: requestId,
            professionalId: professionalId,
            metadata: { journey_status: 'arrived' }
        });

        // Notify customer about arrival
        notifyCustomer(customerId, 'requestUpdate', {
            requestId: requestId,
            newStatus: 'in_progress',
            journeyStatus: 'arrived',
            updateType: 'journey_update',
            professionalName: professionalName
        });

        // Also broadcast to admin
        broadcast('service_request_updated', {
            id: requestId,
            professional_id: professionalId,
            status: 'in_progress',
            journey_status: 'arrived',
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
            `SELECT sr.customer_id
             FROM service_offers so
             JOIN service_requests sr ON sr.id = so.request_id
             WHERE so.request_id = $1 AND so.professional_id = $2 AND so.status = 'accepted'`,
            [requestId, professionalId]
        );
        
        if (!offer.rows.length) {
            await client.query('ROLLBACK');
            return res.status(403).json({ message: 'Not authorized for this request' });
        }

        const customerId = offer.rows[0].customer_id;

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
            timestamp: new Date().toISOString()
        });

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

        // Create persistent notification for customer about payment ready
        await createNotification({
            userId: customerId,
            type: NOTIFICATION_TYPES.PAYMENT_READY,
            title: 'Payment Ready',
            message: `${professionalName} has submitted the wage of ₹${wageAmount}. Please confirm the payment.`,
            requestId: requestId,
            professionalId: professionalId,
            metadata: { journey_status: 'awaiting_payment', wage: wageAmount }
        });

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
