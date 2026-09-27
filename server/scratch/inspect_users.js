const pool = require('../config/database');
(async () => {
  try {
    const { rows } = await pool.query(
      "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'users' ORDER BY ordinal_position"
    );
    console.log('USERS TABLE COLUMNS:');
    rows.forEach(r => console.log(' -', r.column_name, ':', r.data_type));

    const { rows: constraints } = await pool.query(
      "SELECT conname, contype, pg_get_constraintdef(c.oid) as def FROM pg_constraint c WHERE c.conrelid = 'users'::regclass"
    );
    console.log('\nCONSTRAINTS:');
    constraints.forEach(r => console.log(' -', r.conname, '['+r.contype+']', '->', r.def));

    const { rows: users } = await pool.query(
      "SELECT id, SUBSTRING(email, 1, 3) || '***' || RIGHT(email, 4) as email_masked, LEFT(phone, 3) || '****' || RIGHT(phone, 2) as phone_masked FROM users ORDER BY id"
    );
    console.log('\nUSER COUNT:', users.length);
    users.forEach(u => console.log(' id:', u.id, '| email:', u.email_masked, '| phone:', u.phone_masked));
  } catch(e) {
    console.error('Error:', e.message);
  } finally {
    pool.end();
  }
})();
