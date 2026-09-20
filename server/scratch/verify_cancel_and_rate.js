const pool = require('../config/database');
const jwt = require('jsonwebtoken');

async function runTests() {
    console.log('--- Starting Cancellation & Rating Verification Tests ---');

    // 1. Get a test customer and professional
    const userRes = await pool.query("SELECT id, name, email FROM users LIMIT 1");
    if (!userRes.rows.length) {
        throw new Error('No customer found in database');
    }
    const customer = userRes.rows[0];
    const customerToken = jwt.sign(
        { id: customer.id, role: 'customer', email: customer.email },
        process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo',
        { expiresIn: '1d' }
    );

    const proRes = await pool.query("SELECT id, user_id, full_name FROM professionals LIMIT 1");
    if (!proRes.rows.length) {
        throw new Error('No professional found in database');
    }
    const pro = proRes.rows[0];

    console.log(`Using Customer: ID ${customer.id} (${customer.name})`);
    console.log(`Using Professional: ID ${pro.id} (${pro.full_name})`);

    // TEST 1: Create a pending request and cancel it before OTP
    const req1 = await pool.query(
        `INSERT INTO service_requests (customer_id, title, description, location, status, journey_status, is_otp_verified, created_at, requested_at)
         VALUES ($1, 'Test Plumbing Pre-OTP Cancel', 'Testing cancellation', 'Kochi', 'pending', 'accepted', FALSE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [customer.id]
    );
    const req1Id = req1.rows[0].id;
    console.log(`\nCreated Request #1 (Pre-OTP): ID ${req1Id}`);

    // Call cancellation via fetch
    const cancelRes1 = await fetch(`http://localhost:5000/api/user/requests/${req1Id}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`
        }
    });
    const cancelData1 = await cancelRes1.json();
    console.log('Pre-OTP cancel response status:', cancelRes1.status);
    console.log('Pre-OTP cancel message:', cancelData1.message);
    if (cancelRes1.status !== 200 || cancelData1.request?.status !== 'cancelled') {
        throw new Error(`Pre-OTP cancellation failed! status: ${cancelRes1.status}`);
    }
    console.log('✓ TEST 1 PASSED: Pre-OTP cancellation succeeded');

    // TEST 2: Create a request with OTP verified (arrived) and attempt cancellation -> MUST FAIL
    const req2 = await pool.query(
        `INSERT INTO service_requests (customer_id, title, description, location, status, journey_status, is_otp_verified, otp_verified_at, created_at, requested_at)
         VALUES ($1, 'Test Electrician Post-OTP Cancel', 'Testing post-OTP block', 'Kochi', 'in_progress', 'arrived', TRUE, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        [customer.id]
    );
    const req2Id = req2.rows[0].id;
    console.log(`\nCreated Request #2 (Post-OTP Verified): ID ${req2Id}`);

    const cancelRes2 = await fetch(`http://localhost:5000/api/user/requests/${req2Id}/cancel`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`
        }
    });
    const cancelData2 = await cancelRes2.json();
    console.log('Post-OTP cancel response status:', cancelRes2.status);
    console.log('Post-OTP cancel message:', cancelData2.message);
    if (cancelRes2.status !== 400 || !cancelData2.message.includes('Cannot cancel service after OTP')) {
        throw new Error(`Post-OTP cancellation was NOT properly blocked! status: ${cancelRes2.status}`);
    }
    console.log('✓ TEST 2 PASSED: Post-OTP cancellation was correctly rejected');

    // TEST 3: Completed service rating (1 to 5 stars)
    // Mark req2 as completed and assign professional offer
    await pool.query(
        `UPDATE service_requests
         SET status = 'completed', journey_status = 'completed'
         WHERE id = $1`,
        [req2Id]
    );
    await pool.query(
        `INSERT INTO service_offers (request_id, professional_id, status, created_at)
         VALUES ($1, $2, 'accepted', CURRENT_TIMESTAMP)
         ON CONFLICT DO NOTHING`,
        [req2Id, pro.id]
    );

    // Test invalid rating (0 or 6)
    const invalidRateRes = await fetch(`http://localhost:5000/api/user/requests/${req2Id}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`
        }
        ,
        body: JSON.stringify({ rating: 6, comment: 'Too high' })
    });
    console.log('\nInvalid rating (6 stars) response status:', invalidRateRes.status);
    if (invalidRateRes.status !== 400) {
        throw new Error('Rating > 5 was not rejected with 400!');
    }
    console.log('✓ TEST 3A PASSED: Invalid rating properly rejected');

    // Test valid 5-star rating (Excellent service)
    const validRateRes = await fetch(`http://localhost:5000/api/user/requests/${req2Id}/review`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${customerToken}`
        },
        body: JSON.stringify({ rating: 5, comment: 'Punctual, clean work! Excellent service.' })
    });
    const validRateData = await validRateRes.json();
    console.log('\nValid 5-star rating response status:', validRateRes.status);
    console.log('Review returned:', validRateData.review);
    if (validRateRes.status !== 201 || validRateData.review?.rating !== 5) {
        throw new Error(`Rating submission failed! status: ${validRateRes.status}`);
    }
    console.log('✓ TEST 3B PASSED: 5-Star rating saved successfully');

    // Verify rating in DB
    const dbReview = await pool.query(
        'SELECT * FROM professional_reviews WHERE request_id = $1',
        [req2Id]
    );
    console.log('Database professional_reviews row:', dbReview.rows[0]);
    if (dbReview.rows[0]?.rating !== 5) {
        throw new Error('Rating not found in database!');
    }
    console.log('✓ TEST 3C PASSED: Rating verified directly in PostgreSQL database');

    // Clean up test rows
    await pool.query('DELETE FROM professional_reviews WHERE request_id IN ($1, $2)', [req1Id, req2Id]);
    await pool.query('DELETE FROM service_offers WHERE request_id IN ($1, $2)', [req1Id, req2Id]);
    await pool.query('DELETE FROM service_requests WHERE id IN ($1, $2)', [req1Id, req2Id]);
    console.log('\nCleaned up test records.');

    console.log('\n=============================================');
    console.log('ALL BACKEND VERIFICATION TESTS PASSED SUCCESSFULLY!');
    console.log('=============================================');
    await pool.end();
}

runTests().catch(err => {
    console.error('Test error:', err);
    pool.end();
    process.exit(1);
});
