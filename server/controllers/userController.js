const pool = require('../config/database');
const { notifyPro } = require('../utils/proSseClients');
const { broadcast } = require('../utils/sseClients');
const { addCustomerClient, removeCustomerClient } = require('../utils/customerSseClients');

let profilePhotoColumnEnsured = false;
async function ensureProfilePhotoColumn() {
    if (profilePhotoColumnEnsured) return;
    try {
        await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT');
        profilePhotoColumnEnsured = true;
    } catch (err) {
        console.warn('Could not ensure profile_photo column:', err.message);
    }
}

exports.getProfile = async (req, res) => {
    try {
        await ensureProfilePhotoColumn();
        let result;
        try {
            result = await pool.query(
                'SELECT id, name, email, phone, address, profile_photo FROM users WHERE id = $1',
                [req.user.id]
            );
        } catch {
            // Fallback if column still not recognized
            result = await pool.query(
                'SELECT id, name, email, phone, address FROM users WHERE id = $1',
                [req.user.id]
            );
        }
        if (!result.rows[0]) return res.status(404).json({ message: 'Profile not found' });
        res.json(result.rows[0]);
    } catch (err) {
        console.error('getProfile error:', err);
        res.status(500).json({ message: 'Failed to fetch profile' });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        await ensureProfilePhotoColumn();
        const { phone, address } = req.body || {};
        let profile_photo = req.body?.profile_photo || null;
        if (req.file) {
            profile_photo = `/uploads/${req.file.filename}`;
        }

        // Fetch current user data to avoid wiping existing values if omitted
        let current = {};
        try {
            const currentRes = await pool.query(
                'SELECT phone, address, profile_photo FROM users WHERE id = $1',
                [req.user.id]
            );
            if (!currentRes.rows[0]) return res.status(404).json({ message: 'Profile not found' });
            current = currentRes.rows[0];
        } catch {
            const currentRes = await pool.query(
                'SELECT phone, address FROM users WHERE id = $1',
                [req.user.id]
            );
            if (!currentRes.rows[0]) return res.status(404).json({ message: 'Profile not found' });
            current = currentRes.rows[0];
        }

        const updatedPhone = (phone !== undefined && phone !== null && String(phone).trim() !== '') 
            ? String(phone).trim() 
            : current.phone;
        const updatedAddress = address !== undefined 
            ? (String(address).trim() || null) 
            : current.address;
        const updatedPhoto = profile_photo !== null 
            ? profile_photo 
            : (current.profile_photo || null);

        let result;
        try {
            result = await pool.query(
                `UPDATE users SET phone = $1, address = $2, profile_photo = $3
                 WHERE id = $4 RETURNING id, name, email, phone, address, profile_photo`,
                [updatedPhone, updatedAddress, updatedPhoto, req.user.id]
            );
        } catch {
            result = await pool.query(
                `UPDATE users SET phone = $1, address = $2
                 WHERE id = $3 RETURNING id, name, email, phone, address`,
                [updatedPhone, updatedAddress, req.user.id]
            );
        }
        res.json(result.rows[0]);
    } catch (err) {
        console.error('updateProfile error:', err);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

// GET /api/user/addresses - list all saved addresses for current user
exports.getUserAddresses = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT id, user_id, address_type, address_line, landmark, city, state, pincode, latitude, longitude, is_default, created_at
             FROM user_addresses
             WHERE user_id = $1
             ORDER BY is_default DESC, id DESC`,
            [req.user.id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error('getUserAddresses error:', err);
        res.status(500).json({ message: 'Failed to fetch addresses' });
    }
};

// POST /api/user/addresses - add new address for current user (home, work, other)
exports.addUserAddress = async (req, res) => {
    try {
        const {
            address_type = 'home',
            address_line,
            landmark,
            city = 'Thiruvananthapuram',
            state = 'Kerala',
            pincode,
            latitude,
            longitude,
            is_default = false
        } = req.body;

        if (!address_line?.trim()) {
            return res.status(400).json({ message: 'Address line is required' });
        }

        const validTypes = ['home', 'work', 'other'];
        const normalizedType = validTypes.includes(address_type?.toLowerCase()?.trim())
            ? address_type.toLowerCase().trim()
            : 'other';

        // If this address is set to default, clear default flag for user's other addresses
        if (is_default) {
            await pool.query(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
                [req.user.id]
            );
        }

        const result = await pool.query(
            `INSERT INTO user_addresses (
                user_id, address_type, address_line, landmark, city, state, pincode, latitude, longitude, is_default
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
            RETURNING *`,
            [
                req.user.id,
                normalizedType,
                address_line.trim(),
                landmark?.trim() || null,
                city?.trim() || 'Thiruvananthapuram',
                state?.trim() || 'Kerala',
                pincode?.trim() || null,
                latitude ? parseFloat(latitude) : null,
                longitude ? parseFloat(longitude) : null,
                Boolean(is_default)
            ]
        );

        // Also update users.address with latest address
        await pool.query(
            'UPDATE users SET address = $1 WHERE id = $2',
            [address_line.trim(), req.user.id]
        );

        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error('addUserAddress error:', err);
        res.status(500).json({ message: 'Failed to save address' });
    }
};

// PATCH /api/user/addresses/:id - update existing address or set as default
exports.updateUserAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const {
            address_type,
            address_line,
            landmark,
            city,
            state,
            pincode,
            latitude,
            longitude,
            is_default
        } = req.body;

        if (is_default) {
            await pool.query(
                'UPDATE user_addresses SET is_default = FALSE WHERE user_id = $1',
                [req.user.id]
            );
        }

        const result = await pool.query(
            `UPDATE user_addresses SET
                address_type = COALESCE($1, address_type),
                address_line = COALESCE($2, address_line),
                landmark = COALESCE($3, landmark),
                city = COALESCE($4, city),
                state = COALESCE($5, state),
                pincode = COALESCE($6, pincode),
                latitude = COALESCE($7, latitude),
                longitude = COALESCE($8, longitude),
                is_default = COALESCE($9, is_default)
             WHERE id = $10 AND user_id = $11
             RETURNING *`,
            [
                address_type?.toLowerCase()?.trim() || null,
                address_line?.trim() || null,
                landmark !== undefined ? (landmark?.trim() || null) : null,
                city?.trim() || null,
                state?.trim() || null,
                pincode?.trim() || null,
                latitude !== undefined ? parseFloat(latitude) : null,
                longitude !== undefined ? parseFloat(longitude) : null,
                is_default !== undefined ? Boolean(is_default) : null,
                addressId,
                req.user.id
            ]
        );

        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Address not found or unauthorized' });
        }

        res.json(result.rows[0]);
    } catch (err) {
        console.error('updateUserAddress error:', err);
        res.status(500).json({ message: 'Failed to update address' });
    }
};

// DELETE /api/user/addresses/:id - remove saved address
exports.deleteUserAddress = async (req, res) => {
    try {
        const addressId = req.params.id;
        const result = await pool.query(
            'DELETE FROM user_addresses WHERE id = $1 AND user_id = $2 RETURNING id',
            [addressId, req.user.id]
        );
        if (!result.rows[0]) {
            return res.status(404).json({ message: 'Address not found or unauthorized' });
        }
        res.json({ message: 'Address deleted successfully', id: addressId });
    } catch (err) {
        console.error('deleteUserAddress error:', err);
        res.status(500).json({ message: 'Failed to delete address' });
    }
};

// GET /api/user/categories - list all service categories
exports.getCategories = async (req, res) => {
    try {
        const { lang } = req.query;
        let selectQuery = 'SELECT id, name, description FROM categories ORDER BY name ASC';
        if (lang === 'ml') {
            selectQuery = 'SELECT id, COALESCE(name_ml, name) AS name, COALESCE(description_ml, description) AS description FROM categories ORDER BY name ASC';
        }
        const result = await pool.query(selectQuery);
        res.json(result.rows);
    } catch (err) {
        console.error('getCategories error:', err);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

exports.getSubcategories = async (req, res) => {
    try {
        const { category, lang } = req.query;
        let query = 'SELECT id, category_id, category_name, name, image_url, price_estimate FROM subcategories';
        if (lang === 'ml') {
            query = 'SELECT id, category_id, COALESCE(category_name_ml, category_name) AS category_name, COALESCE(name_ml, name) AS name, image_url, price_estimate FROM subcategories';
        }
        const params = [];
        if (category) {
            query += ' WHERE LOWER(category_name) = LOWER($1)';
            params.push(category);
        }
        query += ' ORDER BY category_name ASC, id ASC';
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('getSubcategories error:', err);
        res.status(500).json({ message: 'Failed to fetch subcategories' });
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
            SELECT p.id, p.full_name, p.category, p.sub_category, p.experience_years, p.bio,
                   p.city, p.state, p.transport_mode, p.verified_at,
                   p.registered_latitude, p.registered_longitude,
                   p.current_latitude, p.current_longitude,
                   COALESCE(p.current_latitude, p.registered_latitude) AS effective_latitude,
                   COALESCE(p.current_longitude, p.registered_longitude) AS effective_longitude,
                   CASE WHEN p.profile_photo IS NOT NULL
                        THEN '/uploads/' || p.profile_photo
                        ELSE NULL END AS profile_photo,
                   (SELECT COUNT(*)
                      FROM service_offers so
                      JOIN service_requests sr ON sr.id = so.request_id
                     WHERE so.professional_id = p.id AND sr.status = 'completed') AS completed_requests,
                   (SELECT ROUND(AVG(r.rating)::numeric, 1)
                      FROM professional_reviews r
                     WHERE r.professional_id = p.id) AS avg_rating,
                   (SELECT COUNT(*)
                      FROM professional_reviews r
                     WHERE r.professional_id = p.id) AS review_count
            FROM professionals p
            ${where}
            ORDER BY p.experience_years DESC, p.full_name ASC
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
        const {
            title,
            description,
            requested_at,
            location,
            latitude,
            longitude,
            professional_id,
            category,
            payment_status,
            payment_method,
            transaction_id,
            wage
        } = req.body;
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

            await client.query('ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50)');
            await client.query('ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS transaction_id VARCHAR(100)');

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
                `INSERT INTO service_requests (
                    customer_id, title, description, requested_at, location, latitude, longitude,
                    photo_urls, video_url, voice_url, status, payment_status, payment_method, transaction_id, wage
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending', $11, $12, $13, $14) RETURNING *`,
                [
                    customerId,
                    title,
                    description || null,
                    requested_at,
                    location,
                    Number.isFinite(Number(latitude)) ? latitude : null,
                    Number.isFinite(Number(longitude)) ? longitude : null,
                    photos,
                    video,
                    voice,
                    payment_status || 'pending',
                    payment_method || 'cash',
                    transaction_id || null,
                    wage ? Number(wage) : null
                ]
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
                category: request.category || category,
                requested_at: request.requested_at,
                location: request.location,
                timestamp: new Date().toISOString()
            }));
            broadcast('service_request_created', {
                id: request.id,
                professional_count: nearbyProfessionals.length,
                status: request.status,
                category: request.category || category,
                requested_at: request.requested_at,
                location: request.location,
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
                    p.category AS professional_category,
                    p.profile_photo AS professional_profile_photo,
                    prof_user.phone AS professional_phone,
                    p.current_latitude AS professional_latitude,
                    p.current_longitude AS professional_longitude,
                    (SELECT ROUND(AVG(pr.rating)::numeric, 1) FROM professional_reviews pr WHERE pr.professional_id = p.id) AS professional_avg_rating,
                    (SELECT COUNT(*) FROM professional_reviews pr WHERE pr.professional_id = p.id) AS professional_review_count,
                    review.id AS review_id,
                    review.rating AS review_rating,
                    review.comment AS review_comment
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
                     LEFT JOIN users prof_user ON prof_user.id = p.user_id
                     LEFT JOIN LATERAL (
                         SELECT id, rating, comment
                         FROM professional_reviews
                         WHERE request_id = sr.id AND customer_id = $1
                         LIMIT 1
                     ) review ON true
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

// POST /api/user/requests/:id/review - review a paid service
exports.createReview = async (req, res) => {
    const customerId = req.user.id;
    const requestId = Number(req.params.id);
    const rating = Number(req.body.rating);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : null;

    if (!Number.isInteger(requestId) || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        return res.status(400).json({ message: 'A rating from 1 to 5 is required' });
    }

    try {
        const result = await pool.query(
            `INSERT INTO professional_reviews (request_id, customer_id, professional_id, rating, comment)
             SELECT sr.id, sr.customer_id, accepted_offer.professional_id, $3, $4
             FROM service_requests sr
             JOIN LATERAL (
                 SELECT professional_id
                 FROM service_offers
                 WHERE request_id = sr.id AND status = 'accepted'
                 LIMIT 1
             ) accepted_offer ON true
             WHERE sr.id = $1 AND sr.customer_id = $2
               AND sr.payment_status = 'paid'
               AND sr.status = 'completed'
             ON CONFLICT (request_id) DO NOTHING
             RETURNING id, request_id, rating, comment, created_at`,
            [requestId, customerId, rating, comment || null]
        );

        if (!result.rows.length) {
            return res.status(409).json({ message: 'This service is not eligible for review or has already been reviewed' });
        }

        broadcast('review_submitted', {
            id: result.rows[0].id,
            request_id: requestId,
            rating: result.rows[0].rating,
            timestamp: new Date().toISOString()
        });
        res.status(201).json({ message: 'Review submitted successfully', review: result.rows[0] });
    } catch (err) {
        console.error('createReview error:', err);
        res.status(500).json({ message: 'Failed to submit review' });
    }
};

// GET /api/user/reviews?category=Plumbing - reviews for professionals in a category
exports.getCategoryReviews = async (req, res) => {
    try {
        const { category } = req.query;
        if (!category) {
            return res.status(400).json({ message: 'Category is required' });
        }

        const [reviewsResult, breakdownResult, summaryResult] = await Promise.all([
            pool.query(
                `SELECT r.rating, r.comment, r.created_at,
                        u.name AS customer_name,
                        p.full_name AS professional_name
                 FROM professional_reviews r
                 JOIN professionals p ON p.id = r.professional_id
                 JOIN users u ON u.id = r.customer_id
                 WHERE p.category = $1 AND p.verification_status = 'verified'
                 ORDER BY r.created_at DESC
                 LIMIT 10`,
                [category]
            ),
            pool.query(
                `SELECT r.rating, COUNT(*)::int AS count
                 FROM professional_reviews r
                 JOIN professionals p ON p.id = r.professional_id
                 WHERE p.category = $1 AND p.verification_status = 'verified'
                 GROUP BY r.rating
                 ORDER BY r.rating DESC`,
                [category]
            ),
            pool.query(
                `SELECT ROUND(AVG(r.rating)::numeric, 1) AS avg_rating,
                        COUNT(*)::int AS total_reviews
                 FROM professional_reviews r
                 JOIN professionals p ON p.id = r.professional_id
                 WHERE p.category = $1 AND p.verification_status = 'verified'`,
                [category]
            ),
        ]);

        const breakdown = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
        breakdownResult.rows.forEach(row => {
            breakdown[row.rating] = row.count;
        });
        const total = Object.values(breakdown).reduce((sum, n) => sum + n, 0);
        const percentages = {};
        [5, 4, 3, 2, 1].forEach(star => {
            percentages[star] = total > 0 ? Math.round((breakdown[star] / total) * 100) : 0;
        });

        res.json({
            reviews: reviewsResult.rows,
            avg_rating: summaryResult.rows[0]?.avg_rating || null,
            total_reviews: summaryResult.rows[0]?.total_reviews || 0,
            breakdown,
            percentages,
        });
    } catch (err) {
        console.error('getCategoryReviews error:', err);
        res.status(500).json({ message: 'Failed to fetch reviews' });
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

// GET /api/user/notifications - Real-time notification list for customer
exports.getNotifications = async (req, res) => {
    try {
        const customerId = req.user.id;
        const result = await pool.query(
            `SELECT sr.id as request_id, sr.title, sr.status, sr.journey_status, sr.created_at, sr.updated_at, sr.otp,
                    p.full_name as professional_name, prof_user.phone as professional_phone, p.category as professional_category, p.profile_photo as professional_photo
             FROM service_requests sr
             LEFT JOIN LATERAL (
                 SELECT professional_id FROM service_offers WHERE request_id = sr.id AND status = 'accepted' LIMIT 1
             ) so ON true
             LEFT JOIN professionals p ON p.id = so.professional_id
             LEFT JOIN users prof_user ON prof_user.id = p.user_id
             WHERE sr.customer_id = $1
             ORDER BY sr.updated_at DESC
             LIMIT 30`,
            [customerId]
        );

        const notifications = [];
        for (const row of result.rows) {
            if (row.status === 'completed' || row.journey_status === 'completed') {
                notifications.push({
                    id: `notif_${row.request_id}_completed`,
                    type: 'task_completed',
                    request_id: row.request_id,
                    title: 'Task Completed! 🎉',
                    message: `${row.professional_name || 'Specialist'} has completed "${row.title}". Tap to view invoice & rate your experience.`,
                    timestamp: row.updated_at || row.created_at,
                    is_read: false,
                    metadata: {
                        requestId: row.request_id,
                        professionalName: row.professional_name,
                        serviceTitle: row.title,
                    }
                });
            } else if (['accepted', 'in_progress'].includes(row.status)) {
                notifications.push({
                    id: `notif_${row.request_id}_accepted`,
                    type: 'request_accepted',
                    request_id: row.request_id,
                    title: 'Service Accepted! 🛠️',
                    message: `${row.professional_name || 'A specialist'} has accepted your "${row.title}" request! Arrival OTP: ${row.otp || '****'}`,
                    timestamp: row.updated_at || row.created_at,
                    is_read: false,
                    metadata: {
                        requestId: row.request_id,
                        professionalName: row.professional_name,
                        professionalPhone: row.professional_phone,
                        professionalCategory: row.professional_category,
                        serviceTitle: row.title,
                        otp: row.otp
                    }
                });
            } else if (row.status === 'pending') {
                notifications.push({
                    id: `notif_${row.request_id}_pending`,
                    type: 'booking_created',
                    request_id: row.request_id,
                    title: 'Booking Placed 📋',
                    message: `Your booking for "${row.title}" is being matched with certified specialists nearby.`,
                    timestamp: row.created_at,
                    is_read: true,
                    metadata: {
                        requestId: row.request_id,
                        serviceTitle: row.title
                    }
                });
            }
        }

        res.json({
            notifications,
            unreadCount: notifications.filter(n => !n.is_read).length
        });
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ message: 'Failed to fetch notifications' });
    }
};

exports.markNotificationRead = async (req, res) => {
    res.json({ success: true });
};
