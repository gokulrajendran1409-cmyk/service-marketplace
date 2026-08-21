const db = require('../db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { broadcast } = require('../utils/sseClients');
const { notifyPro } = require('../utils/proSseClients');

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
                COUNT(*) FILTER (WHERE status = 'pending') as pending_requests,
                COUNT(*) FILTER (WHERE status = 'accepted') as accepted_requests
            FROM service_offers 
            WHERE professional_id = $1
        `;
        
        const result = await db.query(statsQuery, [professionalId]);
        
        // Mock earnings for now
        const stats = {
            ...result.rows[0],
            completed_requests: 0, // Need a completed status somewhere, mock to 0
            total_earnings: result.rows[0].accepted_requests * 500 // Assuming 500 per job
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
