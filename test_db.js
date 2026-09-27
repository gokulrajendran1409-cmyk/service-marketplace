const db = require('./server/db.js');
async function run() {
  const res = await db.query('SELECT id, status, photo_urls FROM service_requests ORDER BY id DESC LIMIT 5');
  console.log(res.rows);
  process.exit(0);
}
run();
