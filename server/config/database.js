const { Pool } = require("pg");
const path = require("path");
const fs = require("fs");
const dotenv = require("dotenv");

// Resolve .env file if DATABASE_URL is not yet set
if (!process.env.DATABASE_URL) {
    const candidatePaths = [
        path.resolve(__dirname, "../.env"),
        path.resolve(__dirname, "../utils/.env"),
        path.resolve(process.cwd(), ".env"),
        path.resolve(process.cwd(), "server/.env"),
        path.resolve(process.cwd(), "server/utils/.env")
    ];

    for (const p of candidatePaths) {
        if (fs.existsSync(p)) {
            dotenv.config({ path: p });
            if (process.env.DATABASE_URL) break;
        }
    }
}

if (!process.env.DATABASE_URL) {
    console.error("CRITICAL: DATABASE_URL is not defined in environment or .env files!");
}

let connectionString = process.env.DATABASE_URL;
if (connectionString) {
    try {
        const parsed = new URL(connectionString);
        parsed.searchParams.delete('channel_binding');
        connectionString = parsed.toString();
    } catch (err) {
        // Use raw string if URL parsing fails
    }
}

const pool = new Pool({
    connectionString,
    ssl: {
        rejectUnauthorized: false
    }
});

pool.on('error', (error) => {
    console.error('Unexpected database pool error:', error.message);
});

pool.query('SELECT NOW()', (err, res) => {
    if (err) {
        console.error('Database connection error:', err.message);
    } else {
        console.log('Database connected successfully');
    }
});

module.exports = pool;