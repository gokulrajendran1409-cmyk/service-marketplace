const pool = require('./config/database');

async function run() {
    try {
        const res = await pool.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'professionals';
        `);
        console.log(res.rows.map(r => r.column_name));
    } catch (err) {
        console.error(err);
    } finally {
        process.exit(0);
    }
}

run();
