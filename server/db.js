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

module.exports = pool;