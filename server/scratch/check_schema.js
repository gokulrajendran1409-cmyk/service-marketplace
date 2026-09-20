const pool = require('../config/database');

async function checkSchema() {
  try {
    const pros = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'professionals'
      ORDER BY ordinal_position
    `);
    console.log('--- PROFESSIONALS COLUMNS ---');
    pros.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    const reqs = await pool.query(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'service_requests'
      ORDER BY ordinal_position
    `);
    console.log('--- SERVICE REQUESTS COLUMNS ---');
    reqs.rows.forEach(r => console.log(`${r.column_name}: ${r.data_type}`));

    const proSample = await pool.query(`
      SELECT id, full_name, category, city, state, registered_latitude, registered_longitude, is_online, verification_status
      FROM professionals
      LIMIT 10
    `);
    console.log('--- SAMPLE PROFESSIONALS ---');
    console.log(proSample.rows);

  } catch (err) {
    console.error(err);
  } finally {
    await pool.end();
  }
}

checkSchema();
