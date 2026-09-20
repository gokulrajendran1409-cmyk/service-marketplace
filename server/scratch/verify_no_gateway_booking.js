require('dotenv').config();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

async function testBookingWithoutGateway() {
  console.log('=== TESTING BOOKING FLOW WITHOUT PAYMENT GATEWAY ===\n');

  try {
    const userRes = await pool.query("SELECT id, email, name FROM users LIMIT 1");
    const testUser = userRes.rows[0];
    if (!testUser) throw new Error('No test customer found');

    const token = jwt.sign({ id: testUser.id, role: 'customer', email: testUser.email, name: testUser.name }, JWT_SECRET, { expiresIn: '1h' });

    // Simulate exact payload sent by updated BookingModal (No payment gateway)
    const bookingPayload = {
      title: 'Tap, faucet & mixer fix',
      category: 'Plumbing',
      location: 'Flat 4B, MG Road, Ernakulam, Kerala',
      district: 'Ernakulam',
      pricing_markup_percentage: 30,
      requested_at: new Date(Date.now() + 86400000).toISOString(),
      latitude: 9.9816,
      longitude: 76.2999,
      wage: 605,
      payment_method: 'cash',
      payment_status: 'pending',
      description: 'Fix dripping bathroom tap'
    };

    console.log('Submitting booking without advance payment gateway:');
    console.log(bookingPayload);

    const res = await fetch('http://localhost:5000/api/user/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(bookingPayload)
    });

    if (!res.ok) {
      const err = await res.text();
      throw new Error(`HTTP ${res.status}: ${err}`);
    }

    const data = await res.json();
    console.log('\n✔ Booking Created Successfully! Response:', {
      message: data.message,
      requestId: data.request?.id,
      status: data.request?.status,
      payment_status: data.request?.payment_status,
      payment_method: data.request?.payment_method,
      wage: data.request?.wage,
      district: data.request?.district,
      markup: data.request?.pricing_markup_percentage
    });

    // Check DB
    const dbRow = (await pool.query('SELECT id, status, payment_status, payment_method, wage, district, pricing_markup_percentage FROM service_requests WHERE id = $1', [data.request?.id])).rows[0];
    console.log('\n✔ Verified DB Row:', dbRow);

    if (dbRow.payment_status !== 'pending' || dbRow.payment_method !== 'cash') {
      throw new Error('Payment status/method mismatch in DB');
    }

    // Clean up test request
    await pool.query('DELETE FROM service_requests WHERE id = $1', [dbRow.id]);
    console.log('✔ Cleanup complete.');

    console.log('\n======================================================');
    console.log('🎉 DIRECT BOOKING CONFIRMATION VERIFIED CLEANLY!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Test failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testBookingWithoutGateway();
