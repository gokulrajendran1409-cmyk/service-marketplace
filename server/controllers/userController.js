const pool = require('../config/database');
const { notifyPro } = require('../utils/proSseClients');
const { broadcast } = require('../utils/sseClients');

// GET /api/user/categories - list all service categories
exports.getCategories = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, description FROM categories ORDER BY name ASC'
        );
        res.json(result.rows);
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

// GET /api/user/professionals?category=Plumbing - list verified professionals, optionally filtered by category
exports.getProfessionals = async (req, res) => {
    try {
        const { category } = req.query;
        const params = [];
        let where = "WHERE p.verification_status = 'verified'";
        if (category) {
            params.push(category);
            where += ` AND p.category = $${params.length}`;
        }
        const query = `
            SELECT id, full_name, category, experience_years, bio, city, state
            FROM professionals p
            ${where}
            ORDER BY experience_years DESC
        `;
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('getProfessionals error:', err);
        res.status(500).json({ message: 'Failed to fetch professionals' });
    }
};

// POST /api/user/requests - create a new service request
exports.createRequest = async (req, res) => {
    try {
        const { title, description, location, latitude, longitude, professional_id } = req.body;
        const customerId = req.user.id;

        if (!title || !location || !professional_id) {
            return res.status(400).json({ message: 'Title, location, and a professional are required' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const professional = await client.query(
                "SELECT id, full_name FROM professionals WHERE id = $1 AND verification_status = 'verified'",
                [professional_id]
            );
            if (!professional.rows.length) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'This professional is no longer available' });
            }

            const result = await client.query(
                `INSERT INTO service_requests (customer_id, title, description, location, latitude, longitude, status)
                 VALUES ($1, $2, $3, $4, $5, $6, 'pending') RETURNING *`,
                [customerId, title, description || null, location, Number.isFinite(Number(latitude)) ? latitude : null, Number.isFinite(Number(longitude)) ? longitude : null]
            );
            const request = result.rows[0];
            await client.query(
                `INSERT INTO service_offers (request_id, professional_id, status)
                 VALUES ($1, $2, 'pending')`,
                [request.id, professional_id]
            );
            await client.query('COMMIT');

            notifyPro(Number(professional_id), 'new_service_request', {
                request_id: request.id,
                customer_name: req.user.name || 'A customer',
                title: request.title,
                timestamp: new Date().toISOString()
            });
            broadcast('service_request_created', {
                id: request.id,
                professional_name: professional.rows[0].full_name,
                status: request.status,
                timestamp: new Date().toISOString()
            });

            res.status(201).json({ message: 'Service request sent to the selected professional', request });
        } catch (error) {
            await client.query('ROLLBACK');
            throw error;
        } finally {
            client.release();
        }
    } catch (err) {
        console.error('createRequest error:', err);
        res.status(500).json({ message: 'Failed to create request', error: err.message });
    }
};

// GET /api/user/requests - get all requests for the logged in user
exports.getMyRequests = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await pool.query(
                `SELECT sr.id, sr.title, sr.description, sr.location, sr.latitude, sr.longitude, sr.status, sr.created_at,
                    p.full_name AS professional_name,
                    p.current_latitude AS professional_latitude,
                    p.current_longitude AS professional_longitude
                 FROM service_requests sr
                 LEFT JOIN service_offers so ON so.request_id = sr.id
                 LEFT JOIN professionals p ON p.id = so.professional_id
             WHERE sr.customer_id = $1
                 ORDER BY sr.created_at DESC`,
            [customerId]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('getMyRequests error:', err);
        res.status(500).json({ message: 'Failed to fetch your requests' });
    }
};
