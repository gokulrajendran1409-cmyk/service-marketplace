const pool = require('../config/database');

async function checkPros() {
  try {
    const pros = await pool.query(`
      SELECT id, full_name, category, address, city, state, pincode, 
             registered_latitude, registered_longitude, current_latitude, current_longitude, 
             is_online, verification_status
      FROM professionals
    `);
    console.log(`Total professionals: ${pros.rows.length}`);
    console.log(pros.rows);
  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkPros();
