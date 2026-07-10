const mysql = require('mysql2/promise');
const fs = require('fs');

async function runSchema() {
  try {
    const db = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'Gokul@123',
      multipleStatements: true
    });

    const schema = fs.readFileSync('../database/schema.sql', 'utf8');
    await db.query(schema);
    console.log('Schema executed successfully.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

runSchema();
