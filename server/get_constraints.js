const pool = require('./config/database');
pool.query(`SELECT conname, pg_get_constraintdef(c.oid) FROM pg_constraint c JOIN pg_namespace n ON n.oid = c.connamespace WHERE conrelid = 'service_requests'::regclass;`)
    .then(res => console.log(res.rows))
    .finally(() => process.exit());
