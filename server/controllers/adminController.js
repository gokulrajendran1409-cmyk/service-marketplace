const pool = require("../config/database");

const getDashboard = async (req, res) => {
    try {
        const users = await pool.query(
            `SELECT COUNT(*) FROM users u
             WHERE NOT EXISTS (SELECT 1 FROM professionals p WHERE p.user_id = u.id)`
        );

        const professionals = await pool.query(
            "SELECT COUNT(*) FROM professionals WHERE verification_status = 'verified'"
        );

        const pendingVerification = await pool.query(
            "SELECT COUNT(*) FROM professionals WHERE verification_status = 'pending'"
        );

        const serviceRequests = await pool.query(
            "SELECT COUNT(*) FROM service_requests"
        );

        const payments = await pool.query(
            `SELECT
                COUNT(*) FILTER (WHERE payment_state = 'awaiting_payment')::int AS awaiting_payment,
                COUNT(*) FILTER (WHERE payment_state = 'paid')::int AS paid_payments,
                COALESCE(SUM(wage) FILTER (WHERE payment_state = 'paid'), 0) AS confirmed_payment_value
             FROM (
                SELECT wage, status,
                       CASE
                           WHEN payment_status = 'paid' OR (wage IS NOT NULL AND status = 'completed') THEN 'paid'
                           WHEN payment_status = 'awaiting_payment' OR (wage IS NOT NULL AND status = 'in_progress') THEN 'awaiting_payment'
                           ELSE payment_status
                       END AS payment_state
                FROM service_requests
                WHERE wage IS NOT NULL
             ) payment_records`
        );

        res.json({
            users: Number(users.rows[0].count),
            professionals: Number(professionals.rows[0].count),
            pendingVerification: Number(
                pendingVerification.rows[0].count
            ),
            serviceRequests: Number(
                serviceRequests.rows[0].count
            ),
            awaitingPayments: payments.rows[0].awaiting_payment,
            paidPayments: payments.rows[0].paid_payments,
            confirmedPaymentValue: Number(payments.rows[0].confirmed_payment_value)
        });
    } catch (error) {
        console.error("Dashboard error:", error);

        res.status(500).json({
            message: "Failed to load dashboard"
        });
    }
};
const getUsers = async (req, res) => {
    try {
        const result = await pool.query(`
            SELECT u.id, u.name, u.email, u.phone, u.created_at,
                   COUNT(sr.id)::int AS service_request_count
            FROM users u
            LEFT JOIN professionals p ON p.user_id = u.id
            LEFT JOIN service_requests sr ON sr.customer_id = u.id
            WHERE p.id IS NULL
            GROUP BY u.id
            ORDER BY u.created_at DESC
        `);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching users:', error);
        res.status(500).json({ message: 'Failed to fetch users' });
    }
};

const getPendingVerifications = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.full_name, p.category, p.experience_years, p.bio, p.verification_status, p.created_at,
                json_agg(
                    json_build_object(
                        'type', d.document_type,
                        'url', d.document_url
                    )
                ) as documents
            FROM professionals p
            LEFT JOIN professional_documents d ON p.id = d.professional_id
            WHERE p.verification_status IN ('pending', 'under_review')
            GROUP BY p.id
            ORDER BY p.created_at ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching pending verifications:", error);
        res.status(500).json({ message: "Failed to fetch verifications" });
    }
};

const approveProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        await pool.query(
            "UPDATE professionals SET verification_status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE id = $1",
            [id]
        );
        await pool.query(
            "UPDATE professional_documents SET verification_status = 'verified', verified_at = CURRENT_TIMESTAMP WHERE professional_id = $1",
            [id]
        );
        res.json({ message: "Professional approved successfully" });
    } catch (error) {
        console.error("Error approving professional:", error);
        res.status(500).json({ message: "Failed to approve professional" });
    }
};

const rejectProfessional = async (req, res) => {
    try {
        const { id } = req.params;
        const { reason } = req.body;
        await pool.query(
            "UPDATE professionals SET verification_status = 'rejected', rejection_reason = $2 WHERE id = $1",
            [id, reason]
        );
        await pool.query(
            "UPDATE professional_documents SET verification_status = 'rejected', rejection_reason = $2 WHERE professional_id = $1",
            [id, reason]
        );
        res.json({ message: "Professional rejected successfully" });
    } catch (error) {
        console.error("Error rejecting professional:", error);
        res.status(500).json({ message: "Failed to reject professional" });
    }
};

const getVerifiedProfessionals = async (req, res) => {
    try {
        const query = `
            SELECT id, full_name, category, experience_years, bio, city, state, verified_at, created_at
            FROM professionals
            WHERE verification_status = 'verified'
            ORDER BY verified_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching verified professionals:", error);
        res.status(500).json({ message: "Failed to fetch professionals" });
    }
};

const getAllVerifications = async (req, res) => {
    try {
        const query = `
            SELECT 
                p.id, p.full_name, p.category, p.experience_years, p.bio, 
                p.verification_status, p.rejection_reason, p.verified_at, p.created_at,
                json_agg(
                    json_build_object(
                        'type', d.document_type,
                        'url', d.document_url
                    )
                ) as documents
            FROM professionals p
            LEFT JOIN professional_documents d ON p.id = d.professional_id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error("Error fetching all verifications:", error);
        res.status(500).json({ message: "Failed to fetch verification history" });
    }
};

const getCategories = async (req, res) => {
    try {
        const query = `
            SELECT
                c.id,
                c.name,
                c.description,
                c.created_at,
                COUNT(p.id) FILTER (WHERE p.verification_status = 'verified') AS verified_count,
                COUNT(p.id) AS total_professionals
            FROM categories c
            LEFT JOIN professionals p ON p.category = c.name
            GROUP BY c.id
            ORDER BY c.name ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching categories:', error);
        res.status(500).json({ message: 'Failed to fetch categories' });
    }
};

const getServiceRequests = async (req, res) => {
    try {
        const { status } = req.query; // optional filter: pending | accepted | rejected | completed | cancelled
        const params = [];
        let whereClause = '';

        if (status) {
            params.push(status);
            whereClause = `WHERE sr.status = $1`;
        }

        const query = `
            SELECT
                sr.id,
                sr.status,
                sr.title,
                sr.description,
                sr.location,
                sr.requested_at,
                sr.created_at,
                sr.updated_at,
                sr.wage,
                sr.wage_description,
                CASE
                    WHEN sr.payment_status = 'paid' OR (sr.wage IS NOT NULL AND sr.status = 'completed') THEN 'paid'
                    WHEN sr.payment_status = 'awaiting_payment' OR (sr.wage IS NOT NULL AND sr.status = 'in_progress') THEN 'awaiting_payment'
                    ELSE sr.payment_status
                END AS payment_status,
                u.name   AS user_name,
                u.email  AS user_email,
                offer_summary.offer_count,
                offer_summary.pending_offer_count,
                offer_summary.rejected_professionals,
                p.full_name AS professional_name,
                p.category  AS professional_category
            FROM service_requests sr
            LEFT JOIN users u ON sr.customer_id = u.id
            LEFT JOIN LATERAL (
                SELECT professional_id
                FROM service_offers
                WHERE request_id = sr.id AND status = 'accepted'
                LIMIT 1
            ) target_offer ON true
            LEFT JOIN professionals p ON target_offer.professional_id = p.id
            LEFT JOIN LATERAL (
                SELECT COUNT(*)::int AS offer_count,
                      COUNT(*) FILTER (WHERE status = 'pending')::int AS pending_offer_count,
                      STRING_AGG(professional.full_name, ', ' ORDER BY professional.full_name)
                        FILTER (WHERE service_offers.status = 'rejected') AS rejected_professionals
                FROM service_offers
                  JOIN professionals professional ON professional.id = service_offers.professional_id
                WHERE request_id = sr.id
            ) offer_summary ON true
            ${whereClause}
            ORDER BY sr.created_at DESC
        `;

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching service requests:', error);
        res.status(500).json({ message: 'Failed to fetch service requests' });
    }
};

module.exports = {
    getDashboard,
    getUsers,
    getPendingVerifications,
    approveProfessional,
    rejectProfessional,
    getVerifiedProfessionals,
    getAllVerifications,
    getCategories,
    getServiceRequests
};
