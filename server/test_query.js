const pool = require('./config/database');

async function run() {
    try {
        const result = await pool.query(`
            SELECT p.id, p.full_name, p.date_of_birth, p.address, p.pincode, p.bio,
                p.category, p.sub_category, p.experience_years,
                transport_mode, identity_type, profile_photo, identity_photo,
                p.verification_status, u.phone, u.email
            FROM professionals p
            JOIN users u ON u.id = p.user_id
            LIMIT 1
        `);
        console.log(result.rows);
    } catch (err) {
        console.error("Query Error:", err);
    } finally {
        process.exit(0);
    }
}

run();
