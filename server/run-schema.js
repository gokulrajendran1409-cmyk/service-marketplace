const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

async function runSchema() {
    try {
        // Connect without a specific database first to create it
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            password: process.env.DB_PASSWORD,
            multipleStatements: true // Allows running multiple queries at once
        });

        console.log("Connected to MySQL server.");

        // Read the schema.sql file
        const schemaPath = path.join(__dirname, '..', 'database', 'schema.sql');
        const sql = fs.readFileSync(schemaPath, 'utf8');

        console.log("Executing schema.sql...");
        
        // Execute the SQL file
        await connection.query(sql);
        console.log("✅ Database and tables created successfully!");

        await connection.end();
    } catch (error) {
        console.error("❌ Error executing schema:", error);
    }
}

runSchema();
