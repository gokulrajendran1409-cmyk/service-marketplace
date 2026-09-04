const pool = require('../config/database');

async function cleanup() {
  try {
    const subRes = await pool.query("DELETE FROM subcategories WHERE category_name = 'Vehicle Services' OR category_name ILIKE '%vehicle%'");
    console.log('Deleted subcategories:', subRes.rowCount);

    const vehicleNames = [
      'Vehicle Services', 'Vehicle Servicing', 'Service Booking', 'Car Wash & Detailing',
      'Inspection & Vehicle Diagnosis', 'Tyres & Wheels', 'Battery Services',
      'AC & Climate Services', 'Parts & Accessories', 'Roadside Assistance',
      'Find Service Centers', 'Insurance'
    ];
    const catRes = await pool.query("DELETE FROM categories WHERE name = ANY($1)", [vehicleNames]);
    console.log('Deleted categories:', catRes.rowCount);

    const remaining = await pool.query("SELECT id, name FROM categories ORDER BY id");
    console.log('Remaining categories (' + remaining.rowCount + '):', remaining.rows.map(r => r.name));

    const subCount = await pool.query("SELECT category_name, count(*) FROM subcategories GROUP BY category_name ORDER BY category_name");
    console.log('Remaining subcategories:');
    console.table(subCount.rows);
  } catch (err) {
    console.error('Error during cleanup:', err);
  } finally {
    await pool.end();
  }
}

cleanup();
