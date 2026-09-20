const pool = require('../config/database');
const jwt = require('jsonwebtoken');
const { checkAndSend1HourReminders } = require('../services/reminderService');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

async function runTests() {
    console.log('=== Starting 1-Hour Prior Service Reminder Verification ===\n');

    // 1. Get test customer and professional
    const userRes = await pool.query("SELECT id, name, email FROM users LIMIT 1");
    if (!userRes.rows.length) throw new Error('No user found in database');
    const customer = userRes.rows[0];
    const customerToken = jwt.sign(
        { id: customer.id, role: 'customer', email: customer.email, name: customer.name },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    const proRes = await pool.query(
        `SELECT p.id, p.user_id, p.full_name, u.email
         FROM professionals p
         JOIN users u ON u.id = p.user_id
         LIMIT 1`
    );
    if (!proRes.rows.length) throw new Error('No professional found in database');
    const pro = proRes.rows[0];
    const proToken = jwt.sign(
        { id: pro.user_id, professionalId: pro.id, role: 'professional', email: pro.email },
        JWT_SECRET,
        { expiresIn: '1d' }
    );

    console.log(`Test Customer: ID ${customer.id} (${customer.name})`);
    console.log(`Test Provider: ID ${pro.id} (User ID ${pro.user_id}, Name: ${pro.full_name})\n`);

    // TEST 1: Service scheduled 50 minutes from now (within the 1-hour window)
    const scheduledTime = new Date(Date.now() + 50 * 60 * 1000); // 50 mins in future
    const req1 = await pool.query(
        `INSERT INTO service_requests (customer_id, title, description, location, status, journey_status, requested_at, created_at)
         VALUES ($1, 'AC Repair Scheduled', 'Urgent cooling issue', 'Kaloor, Kochi', 'accepted', 'accepted', $2, CURRENT_TIMESTAMP)
         RETURNING id`,
        [customer.id, scheduledTime]
    );
    const req1Id = req1.rows[0].id;
    console.log(`Created Booking #1 (scheduled for 50 mins from now): ID ${req1Id}`);

    // Assign selected professional offer
    await pool.query(
        `INSERT INTO service_offers (request_id, professional_id, status, created_at)
         VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)`,
        [req1Id, pro.id]
    );

    // Run reminder check
    console.log('\nRunning checkAndSend1HourReminders()...');
    await checkAndSend1HourReminders();

    // Verify customer notification in database
    const custNotif = await pool.query(
        `SELECT * FROM notifications WHERE user_id = $1 AND request_id = $2 AND type = 'service_reminder_customer'`,
        [customer.id, req1Id]
    );
    console.log('\n[Check 1] Customer Notification stored in DB:');
    if (!custNotif.rows.length) {
        throw new Error('Customer reminder notification was NOT created in DB!');
    }
    console.log('Title:', custNotif.rows[0].title);
    console.log('Message:', custNotif.rows[0].message);
    console.log('Type:', custNotif.rows[0].type);
    console.log('is_read:', custNotif.rows[0].is_read);
    if (!custNotif.rows[0].message.includes('pre-booked service') || !custNotif.rows[0].message.includes('1 hour')) {
        throw new Error('Customer message missing expected pre-booked reminder content!');
    }
    console.log('✓ PASS: Customer reminder correctly stored in DB');

    // Verify provider notification in database
    const proNotif = await pool.query(
        `SELECT * FROM notifications WHERE professional_id = $1 AND request_id = $2 AND type = 'service_reminder_pro'`,
        [pro.id, req1Id]
    );
    console.log('\n[Check 2] Provider Notification stored in DB:');
    if (!proNotif.rows.length) {
        throw new Error('Provider reminder notification was NOT created in DB!');
    }
    console.log('Title:', proNotif.rows[0].title);
    console.log('Message:', proNotif.rows[0].message);
    console.log('Type:', proNotif.rows[0].type);
    console.log('is_read:', proNotif.rows[0].is_read);
    if (!proNotif.rows[0].message.includes('avoid being late') || !proNotif.rows[0].message.includes('1 hour')) {
        throw new Error('Provider message missing expected "avoid being late" content!');
    }
    console.log('✓ PASS: Provider reminder correctly stored in DB');

    // TEST 2: Deduplication test
    console.log('\n[Check 3] Running checkAndSend1HourReminders() again for deduplication...');
    await checkAndSend1HourReminders();
    const custNotifCount = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE user_id = $1 AND request_id = $2 AND type = 'service_reminder_customer'`,
        [customer.id, req1Id]
    );
    const proNotifCount = await pool.query(
        `SELECT COUNT(*) FROM notifications WHERE professional_id = $1 AND request_id = $2 AND type = 'service_reminder_pro'`,
        [pro.id, req1Id]
    );
    if (parseInt(custNotifCount.rows[0].count) !== 1 || parseInt(proNotifCount.rows[0].count) !== 1) {
        throw new Error(`Deduplication failed! Counts: cust=${custNotifCount.rows[0].count}, pro=${proNotifCount.rows[0].count}`);
    }
    console.log('✓ PASS: Exactly 1 notification persisted per recipient (deduplication confirmed)');

    // TEST 3: User Notification API endpoint
    console.log('\n[Check 4] Calling GET /api/user/notifications...');
    const userNotifsRes = await fetch('http://localhost:5000/api/user/notifications', {
        headers: { Authorization: `Bearer ${customerToken}` }
    });
    const userNotifsData = await userNotifsRes.json();
    console.log('User notifications count:', userNotifsData.notifications?.length);
    const foundUserReminder = userNotifsData.notifications?.find(n => n.type === 'service_reminder_customer' && Number(n.request_id) === Number(req1Id));
    if (!foundUserReminder) {
        throw new Error('Service reminder was not returned by GET /api/user/notifications!');
    }
    console.log('Found user reminder in API response:', foundUserReminder.title);
    console.log('✓ PASS: User notifications API returns reminder notification');

    // TEST 4: Professional Notification API endpoint
    console.log('\n[Check 5] Calling GET /api/professionals/notifications...');
    const proNotifsRes = await fetch('http://localhost:5000/api/professionals/notifications', {
        headers: { Authorization: `Bearer ${proToken}` }
    });
    const proNotifsData = await proNotifsRes.json();
    console.log('Pro notifications count:', proNotifsData.notifications?.length);
    const foundProReminder = proNotifsData.notifications?.find(n => n.type === 'service_reminder_pro' && Number(n.request_id) === Number(req1Id));
    if (!foundProReminder) {
        throw new Error('Service reminder was not returned by GET /api/professionals/notifications!');
    }
    console.log('Found pro reminder in API response:', foundProReminder.title);
    console.log('✓ PASS: Professional notifications API returns provider reminder notification');

    // TEST 5: Far-future booking (> 1 hour) should NOT trigger reminder yet
    console.log('\n[Check 6] Testing booking scheduled for 3 hours in the future...');
    const futureTime = new Date(Date.now() + 3 * 3600 * 1000);
    const req2 = await pool.query(
        `INSERT INTO service_requests (customer_id, title, description, location, status, journey_status, requested_at, created_at)
         VALUES ($1, 'Painting Future Job', 'Living room painting', 'Edappally', 'accepted', 'accepted', $2, CURRENT_TIMESTAMP)
         RETURNING id`,
        [customer.id, futureTime]
    );
    const req2Id = req2.rows[0].id;
    await pool.query(
        `INSERT INTO service_offers (request_id, professional_id, status, created_at)
         VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)`,
        [req2Id, pro.id]
    );

    await checkAndSend1HourReminders();

    const futureNotifs = await pool.query(
        `SELECT * FROM notifications WHERE request_id = $1`,
        [req2Id]
    );
    if (futureNotifs.rows.length > 0) {
        throw new Error('Reminder was prematurely triggered for a booking 3 hours away!');
    }
    console.log('✓ PASS: No reminder created for job scheduled 3 hours away');

    // Clean up test data
    console.log('\nCleaning up test records...');
    await pool.query('DELETE FROM notifications WHERE request_id IN ($1, $2)', [req1Id, req2Id]);
    await pool.query('DELETE FROM service_offers WHERE request_id IN ($1, $2)', [req1Id, req2Id]);
    await pool.query('DELETE FROM service_requests WHERE id IN ($1, $2)', [req1Id, req2Id]);
    console.log('Cleanup completed.');

    console.log('\n======================================================');
    console.log('ALL 1-HOUR REMINDER NOTIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('======================================================');
    await pool.end();
}

runTests().catch(err => {
    console.error('\n❌ Test Error:', err);
    pool.end();
    process.exit(1);
});
