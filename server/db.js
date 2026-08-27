const { Pool } = require("pg");

require("dotenv").config();

const databaseUrl = new URL(process.env.DATABASE_URL);
databaseUrl.searchParams.delete('channel_binding');

const pool = new Pool({
    connectionString: databaseUrl.toString(),
    ssl: {
        rejectUnauthorized: false
    }
});
pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Database connected successfully');
    }
});

module.exports = pool;