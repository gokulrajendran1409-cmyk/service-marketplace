require('dotenv').config();
const pool = require('../db');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

async function runVerification() {
  console.log('=== STARTING DISTRICT PRICING & CROSS-DISTRICT VERIFICATION ===\n');

  try {
    // 1. Verify district_pricing_tiers in DB
    const tiersRes = await pool.query('SELECT district, markup_percentage, tier_name FROM district_pricing_tiers ORDER BY markup_percentage, district');
    console.log(`Found ${tiersRes.rows.length} districts in district_pricing_tiers:`);
    tiersRes.rows.forEach(r => {
      console.log(`  - ${r.district.padEnd(20)}: +${r.markup_percentage}% (${r.tier_name})`);
    });

    const tier1Districts = ['Kasaragod', 'Pathanamthitta', 'Idukki', 'Wayanad'];
    const tier2Districts = ['Thrissur', 'Kollam', 'Alappuzha', 'Kottayam', 'Malappuram'];
    const tier3Districts = ['Ernakulam', 'Thiruvananthapuram', 'Kozhikode'];

    for (const d of tier1Districts) {
      const match = tiersRes.rows.find(r => r.district.toLowerCase() === d.toLowerCase());
      if (!match || Number(match.markup_percentage) !== 0) {
        throw new Error(`Tier 1 district ${d} has invalid markup: ${match?.markup_percentage}`);
      }
    }
    console.log('✔ Tier 1 (0% markup) districts verified!');

    for (const d of tier2Districts) {
      const match = tiersRes.rows.find(r => r.district.toLowerCase() === d.toLowerCase());
      if (!match || Number(match.markup_percentage) !== 20) {
        throw new Error(`Tier 2 district ${d} has invalid markup: ${match?.markup_percentage}`);
      }
    }
    console.log('✔ Tier 2 (20% markup) districts verified!');

    for (const d of tier3Districts) {
      const match = tiersRes.rows.find(r => r.district.toLowerCase() === d.toLowerCase());
      if (!match || Number(match.markup_percentage) !== 30) {
        throw new Error(`Tier 3 district ${d} has invalid markup: ${match?.markup_percentage}`);
      }
    }
    console.log('✔ Tier 3 (30% markup) districts verified!');

    // 2. Test GET /api/user/district-pricing via HTTP
    const pricingRes = await fetch('http://localhost:5000/api/user/district-pricing');
    if (!pricingRes.ok) throw new Error(`GET /district-pricing returned HTTP ${pricingRes.status}`);
    const pricingData = await pricingRes.json();
    console.log(`\n✔ GET /api/user/district-pricing returned ${pricingData.length} entries.`);

    // 3. Test GET /api/user/professionals destination district filtering
    console.log('\n--- Testing Destination District Pro Matching ---');

    const ernakulamProsRes = await fetch('http://localhost:5000/api/user/professionals?category=Plumbing&district=Ernakulam');
    const ernakulamPros = await ernakulamProsRes.json();
    console.log(`Ernakulam returned ${ernakulamPros.length} pros:`, ernakulamPros.map(p => `${p.full_name} (${p.district})`));
    if (!ernakulamPros.some(p => p.district === 'Ernakulam')) {
      throw new Error('Ernakulam pros query did not return Ernakulam professionals!');
    }
    console.log('✔ Ernakulam query returned destination district professionals.');

    const kasaragodProsRes = await fetch('http://localhost:5000/api/user/professionals?category=Plumbing&district=Kasaragod');
    const kasaragodPros = await kasaragodProsRes.json();
    console.log(`Kasaragod returned ${kasaragodPros.length} pros:`, kasaragodPros.map(p => `${p.full_name} (${p.district})`));
    if (!kasaragodPros.some(p => p.district === 'Kasaragod')) {
      throw new Error('Kasaragod pros query did not return Kasaragod professionals!');
    }
    console.log('✔ Kasaragod query returned destination district professionals.');

    const thrissurProsRes = await fetch('http://localhost:5000/api/user/professionals?category=Plumbing&district=Thrissur');
    const thrissurPros = await thrissurProsRes.json();
    console.log(`Thrissur returned ${thrissurPros.length} pros:`, thrissurPros.map(p => `${p.full_name} (${p.district})`));
    if (!thrissurPros.some(p => p.district === 'Thrissur')) {
      throw new Error('Thrissur pros query did not return Thrissur professionals!');
    }
    console.log('✔ Thrissur query returned destination district professionals.');

    // 4. Test Cross-District Booking via POST /api/user/requests
    console.log('\n--- Testing Cross-District Service Request Booking ---');
    // Find or create test user
    let userRes = await pool.query("SELECT id, email, name FROM users LIMIT 1");
    let testUser = userRes.rows[0];
    if (!testUser) {
      const ins = await pool.query(
        "INSERT INTO users (name, email, phone, password_hash, role) VALUES ('Test Customer', 'testcustomer@marketplace.com', '9895000001', 'hashed', 'customer') RETURNING id, email, name"
      );
      testUser = ins.rows[0];
    }

    const testToken = jwt.sign({ id: testUser.id, role: 'customer', email: testUser.email }, JWT_SECRET, { expiresIn: '1h' });

    // Scenario: Customer is located in Kasaragod, but books for service in Ernakulam (destination)
    console.log('Creating cross-district booking (Customer in Kasaragod -> Service destination in Ernakulam)...');
    const bookingRes = await fetch('http://localhost:5000/api/user/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        title: 'Pipe Leakage Repair',
        category: 'Plumbing',
        location: 'Marine Drive, Kochi, Ernakulam, Kerala - 682031',
        district: 'Ernakulam',
        pricing_markup_percentage: 30,
        requested_at: new Date(Date.now() + 86400000).toISOString(),
        latitude: 9.9816,
        longitude: 76.2999,
        wage: 605,
        payment_method: 'upi',
        payment_status: 'paid',
        transaction_id: `UPI-TEST-${Date.now()}`,
        description: 'Customer in Kasaragod booking for Ernakulam apartment'
      })
    });

    if (!bookingRes.ok) {
      const errText = await bookingRes.text();
      throw new Error(`Failed to create cross-district booking: ${bookingRes.status} ${errText}`);
    }

    const bookingResult = await bookingRes.json();
    console.log('Booking response:', bookingResult);

    // Verify stored row in database
    const reqRowRes = await pool.query(
      'SELECT id, title, district, pricing_markup_percentage, wage, final_amount FROM service_requests WHERE id = $1',
      [bookingResult.request?.id || bookingResult.id]
    );
    const reqRow = reqRowRes.rows[0];
    console.log('Stored service_request row in DB:', reqRow);

    if (reqRow.district !== 'Ernakulam') {
      throw new Error(`Expected stored district 'Ernakulam', got '${reqRow.district}'`);
    }
    if (Number(reqRow.pricing_markup_percentage) !== 30) {
      throw new Error(`Expected pricing_markup_percentage 30, got '${reqRow.pricing_markup_percentage}'`);
    }

    // Verify assigned/notified pro is from Ernakulam
    const notifiedProsRes = await pool.query(
      'SELECT so.professional_id, p.full_name, p.district FROM service_offers so JOIN professionals p ON so.professional_id = p.id WHERE so.request_id = $1',
      [reqRow.id]
    );
    console.log('Dispatched / Notified Professionals:', notifiedProsRes.rows);
    if (notifiedProsRes.rows.length > 0) {
      const dispatchedPro = notifiedProsRes.rows[0];
      if (dispatchedPro.district !== 'Ernakulam') {
        throw new Error(`Expected dispatched pro to be in Ernakulam, got: ${dispatchedPro.district}`);
      }
      console.log(`✔ Dispatched to Ernakulam professional: ${dispatchedPro.full_name} (${dispatchedPro.district})`);
    }
    console.log('✔ Cross-district booking verified successfully with +30% Ernakulam surge!');

    // 5. Test Tier 2 booking in Thrissur (+20%)
    console.log('\nCreating booking in Thrissur (+20% surge)...');
    const thrissurBookingRes = await fetch('http://localhost:5000/api/user/requests', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${testToken}`
      },
      body: JSON.stringify({
        title: 'Bathroom Tap Replacement',
        category: 'Plumbing',
        location: 'Round North, Thrissur, Kerala - 680001',
        district: 'Thrissur',
        pricing_markup_percentage: 20,
        requested_at: new Date(Date.now() + 86400000).toISOString(),
        latitude: 10.5276,
        longitude: 76.2144,
        wage: 560,
        payment_method: 'cash',
        payment_status: 'pending',
        description: 'Thrissur booking'
      })
    });

    const thrissurResult = await thrissurBookingRes.json();
    const thrissurRow = (await pool.query(
      'SELECT id, title, district, pricing_markup_percentage, wage FROM service_requests WHERE id = $1',
      [thrissurResult.request?.id || thrissurResult.id]
    )).rows[0];
    console.log('Stored Thrissur service_request in DB:', thrissurRow);
    if (thrissurRow.district !== 'Thrissur' || Number(thrissurRow.pricing_markup_percentage) !== 20) {
      throw new Error('Thrissur booking markup mismatch!');
    }
    console.log('✔ Thrissur booking verified successfully with +20% surge!');

    // Clean up test bookings
    await pool.query('DELETE FROM service_requests WHERE id IN ($1, $2)', [
      bookingResult.request?.id || bookingResult.id,
      thrissurResult.request?.id || thrissurResult.id
    ]);
    console.log('✔ Test cleanup complete.');

    console.log('\n======================================================');
    console.log('🎉 ALL DISTRICT PRICING & CROSS-DISTRICT CHECKS PASSED!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('❌ Verification failed:', err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runVerification();
