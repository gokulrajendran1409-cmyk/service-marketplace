const pool = require('./config/database'); pool.query('SELECT * FROM service_requests LIMIT 1').then(res => console.log(Object.keys(res.rows[0]))).finally(() => process.exit());
