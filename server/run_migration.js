const pool = require('./config/database');

async function run() {
    try {
        await pool.query(`
            ALTER TABLE professionals
            ADD COLUMN IF NOT EXISTS profile_photo TEXT,
            ADD COLUMN IF NOT EXISTS sub_category VARCHAR(255),
            ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50),
            ADD COLUMN IF NOT EXISTS identity_type VARCHAR(50),
            ADD COLUMN IF NOT EXISTS identity_photo TEXT;
        `);
        console.log("Migration successful!");
    } catch (err) {
        console.error("Migration failed:", err);
    } finally {
        process.exit(0);
    }
}

run();
