const pool = require('../config/database');
const { notifyPro } = require('../utils/proSseClients');
const { broadcast } = require('../utils/sseClients');
const { addCustomerClient, removeCustomerClient } = require('../utils/customerSseClients');

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
        const { category, latitude, longitude } = req.query;
        const params = [];
        let where = "WHERE p.verification_status = 'verified'";
        if (category) {
            params.push(category);
            where += ` AND p.category = $${params.length}`;
        }
        const query = `
                 SELECT id, full_name, category, experience_years, bio, city, state,
                     registered_latitude, registered_longitude
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
        const { title, description, requested_at, location, latitude, longitude, professional_id, category } = req.body;
        const photos = (req.files?.photos || []).map(file => `/uploads/${file.filename}`);
        const video = req.files?.video?.[0] ? `/uploads/${req.files.video[0].filename}` : null;
        const voice = req.files?.voice?.[0] ? `/uploads/${req.files.voice[0].filename}` : null;
        const customerId = req.user.id;

        if (!title || !location || !category || !requested_at) {
            return res.status(400).json({ message: 'Title, location, category, and expected professional arrival time are required' });
        }
        if (!Number.isFinite(new Date(requested_at).getTime()) || new Date(requested_at).getTime() <= Date.now()) {
            return res.status(400).json({ message: 'Expected professional arrival time must be in the future' });
        }

        const client = await pool.connect();
        try {
            await client.query('BEGIN');
            const professionals = await client.query(
                                `SELECT p.id, p.full_name, p.registered_latitude, p.registered_longitude
                                 FROM professionals p
                                 WHERE p.category = $1 AND p.verification_status = 'verified'
                                     AND ($2::bigint IS NULL OR p.id = $2)
                                     AND ($2::bigint IS NOT NULL OR (p.registered_latitude IS NOT NULL AND p.registered_longitude IS NOT NULL))
                                     AND NOT EXISTS (
                                             SELECT 1
                                             FROM service_offers active_offer
                                             JOIN service_requests active_request ON active_request.id = active_offer.request_id
                                             WHERE active_offer.professional_id = p.id
                                                 AND active_offer.status = 'accepted'
                                                 AND active_request.status IN ('accepted', 'in_progress')
                                     )`,
                [category, professional_id && professional_id !== 'undefined' ? professional_id : null]
            );
            const userLatitude = Number(latitude);
            const userLongitude = Number(longitude);
            const nearbyProfessionals = professional_id && professional_id !== 'undefined'
                ? professionals.rows
                : professionals.rows.filter(professional => {
                const latitudeDelta = (Number(professional.registered_latitude) - userLatitude) * Math.PI / 180;
                const longitudeDelta = (Number(professional.registered_longitude) - userLongitude) * Math.PI / 180;
                const latitude1 = userLatitude * Math.PI / 180;
                const latitude2 = Number(professional.registered_latitude) * Math.PI / 180;
                const haversine = Math.sin(latitudeDelta / 2) ** 2
                    + Math.cos(latitude1) * Math.cos(latitude2) * Math.sin(longitudeDelta / 2) ** 2;
                const distanceKm = 6371 * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
                return Number.isFinite(distanceKm) && distanceKm <= 15;
                });
            if (!nearbyProfessionals.length) {
                await client.query('ROLLBACK');
                return res.status(404).json({ message: 'No available professionals were found. Professionals currently handling jobs will receive new requests after completing them.' });
            }

            const result = await client.query(
                `INSERT INTO service_requests (customer_id, title, description, requested_at, location, latitude, longitude, photo_urls, video_url, voice_url, status)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending') RETURNING *`,
                [customerId, title, description || null, requested_at, location, Number.isFinite(Number(latitude)) ? latitude : null, Number.isFinite(Number(longitude)) ? longitude : null, photos, video, voice]
            );
            const request = result.rows[0];
            for (const professional of nearbyProfessionals) {
                await client.query(
                    `INSERT INTO service_offers (request_id, professional_id, status)
                     VALUES ($1, $2, 'pending')`,
                    [request.id, professional.id]
                );
            }
            await client.query('COMMIT');

            nearbyProfessionals.forEach(professional => notifyPro(Number(professional.id), 'new_service_request', {
                request_id: request.id,
                customer_name: req.user.name || 'A customer',
                title: request.title,
                timestamp: new Date().toISOString()
            }));
            broadcast('service_request_created', {
                id: request.id,
                professional_count: nearbyProfessionals.length,
                status: request.status,
                timestamp: new Date().toISOString()
            });

            res.status(201).json({ message: `Request sent to ${nearbyProfessionals.length} nearby professionals`, request });
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
                    `SELECT sr.id, sr.title, sr.description, sr.requested_at, sr.location, sr.latitude, sr.longitude, sr.photo_urls, sr.video_url, sr.voice_url, sr.status, sr.journey_status, sr.journey_updated_at, sr.created_at, sr.otp, sr.wage, sr.wage_description, sr.payment_status,
                        offer_summary.offer_count,
                        offer_summary.pending_offer_count,
                    p.full_name AS professional_name,
                    p.current_latitude AS professional_latitude,
                    p.current_longitude AS professional_longitude
                 FROM service_requests sr
                      LEFT JOIN LATERAL (
                          SELECT COUNT(*)::int AS offer_count,
                                    COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_offer_count
                          FROM service_offers
                          WHERE request_id = sr.id
                      ) offer_summary ON true
                      LEFT JOIN LATERAL (
                          SELECT professional_id
                          FROM service_offers
                          WHERE request_id = sr.id
                            AND (status = 'accepted' OR offer_summary.offer_count = 1)
                          ORDER BY CASE WHEN status = 'accepted' THEN 0 ELSE 1 END, id
                          LIMIT 1
                      ) selected_offer ON true
                     LEFT JOIN professionals p ON p.id = selected_offer.professional_id
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

// GET /api/user/notifications/stream - SSE connection for real-time customer updates
exports.streamNotifications = (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

    const customerId = req.user.id;
    addCustomerClient(customerId, res);

    const keepAlive = setInterval(() => {
        try {
            res.write(': keepalive\n\n');
        } catch {
            clearInterval(keepAlive);
        }
    }, 15000);

    req.on('close', () => {
        clearInterval(keepAlive);
        removeCustomerClient(customerId, res);
    });
};

// POST /api/user/requests/:id/confirm-payment
exports.confirmPayment = async (req, res) => {
    const customerId = req.user.id;
    const requestId = Number(req.params.id);

    if (!Number.isInteger(requestId)) {
        return res.status(400).json({ message: 'Invalid request ID' });
    }

    try {
        const result = await pool.query(
            `UPDATE service_requests
             SET payment_status = 'paid',
                 status = 'completed',
                 journey_status = 'completed',
                 updated_at = CURRENT_TIMESTAMP
             WHERE id = $1 AND customer_id = $2 AND payment_status = 'awaiting_payment'
             RETURNING *`,
            [requestId, customerId]
        );

        if (!result.rows.length) {
            return res.status(404).json({ message: 'Request not found or payment already confirmed' });
        }

        const { broadcast: broadcastSse } = require('../utils/sseClients');
        broadcastSse('payment_confirmed', {
            id: requestId,
            customer_id: customerId,
            payment_status: 'paid',
            timestamp: new Date().toISOString()
        });

        res.json({ message: 'Payment confirmed successfully', request: result.rows[0] });
    } catch (err) {
        console.error('confirmPayment error:', err);
        res.status(500).json({ message: 'Failed to confirm payment' });
    }
};
