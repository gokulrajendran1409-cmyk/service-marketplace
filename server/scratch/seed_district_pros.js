const pool = require('../config/database');
const bcrypt = require('bcrypt');

const DISTRICT_PROS = [
  {
    name: 'Suresh Kumar',
    email: 'suresh.ernakulam@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Pipe leak & burst repair, Tap, faucet & mixer fix',
    district: 'Ernakulam',
    city: 'Kochi',
    address: 'Panampilly Nagar, Kochi, Ernakulam, Kerala - 682036',
    lat: 9.9620,
    lon: 76.2940,
    exp: 8,
    bio: 'Master certified plumber with 8+ years experience across Ernakulam & Kochi.'
  },
  {
    name: 'Rahul Nair',
    email: 'rahul.trivandrum@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Pipe leak & burst repair, Bathroom & kitchen pipe fitting',
    district: 'Thiruvananthapuram',
    city: 'Thiruvananthapuram',
    address: 'Vazhuthacaud, Thiruvananthapuram, Kerala - 695014',
    lat: 8.4980,
    lon: 76.9570,
    exp: 6,
    bio: 'Licensed sanitary and water pipe repair specialist based in Thiruvananthapuram.'
  },
  {
    name: 'Mohammed Faisal',
    email: 'faisal.kozhikode@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Drain & sewer unclogging, Motor & water pump repair',
    district: 'Kozhikode',
    city: 'Kozhikode',
    address: 'Mavoor Road, Kozhikode, Kerala - 673004',
    lat: 11.2610,
    lon: 75.7890,
    exp: 7,
    bio: 'Experienced pump technician and residential plumbing specialist in Kozhikode.'
  },
  {
    name: 'Anoop Menon',
    email: 'anoop.thrissur@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Toilet & cistern repair, Tap, faucet & mixer fix',
    district: 'Thrissur',
    city: 'Thrissur',
    address: 'Swaraj Round, Thrissur, Kerala - 680001',
    lat: 10.5250,
    lon: 76.2140,
    exp: 5,
    bio: 'Reliable plumbing expert providing fast emergency solutions in Thrissur.'
  },
  {
    name: 'Jithin Das',
    email: 'jithin.kollam@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Water tank cleaning & sanitization, Pipe leak & burst repair',
    district: 'Kollam',
    city: 'Kollam',
    address: 'Chinnakada, Kollam, Kerala - 691001',
    lat: 8.8870,
    lon: 76.5940,
    exp: 4,
    bio: 'Prompt and certified plumber serving Kollam district.'
  },
  {
    name: 'Vipin George',
    email: 'vipin.kottayam@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Water heater & geyser service, Pipe leak repair',
    district: 'Kottayam',
    city: 'Kottayam',
    address: 'Collectorate Junction, Kottayam, Kerala - 686002',
    lat: 9.5890,
    lon: 76.5210,
    exp: 9,
    bio: 'High-precision plumbing and bathroom fittings expert in Kottayam.'
  },
  {
    name: 'Shaji Mathew',
    email: 'shaji.kasaragod@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Pipe leak & burst repair, Motor & water pump repair',
    district: 'Kasaragod',
    city: 'Kasaragod',
    address: 'Kanhangad, Kasaragod, Kerala - 671315',
    lat: 12.3080,
    lon: 75.0910,
    exp: 6,
    bio: 'Dedicated water supply and pipe mechanic serving Kasaragod district.'
  },
  {
    name: 'Gopakumar P',
    email: 'gopa.pathanamthitta@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Bathroom & kitchen pipe fitting, Tap & mixer fix',
    district: 'Pathanamthitta',
    city: 'Pathanamthitta',
    address: 'Ring Road, Pathanamthitta, Kerala - 689645',
    lat: 9.2680,
    lon: 76.7840,
    exp: 5,
    bio: 'Experienced plumber serving homes across Pathanamthitta.'
  },
  {
    name: 'Biju Varghese',
    email: 'biju.wayanad@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Pipe leak & burst repair, Motor & water pump repair',
    district: 'Wayanad',
    city: 'Kalpetta',
    address: 'Main Town, Kalpetta, Wayanad, Kerala - 673121',
    lat: 11.6080,
    lon: 76.0820,
    exp: 8,
    bio: 'Specialist in mountain terrain water systems and residential plumbing in Wayanad.'
  },
  {
    name: 'Santosh K',
    email: 'santosh.idukki@marketplace.com',
    category: 'Plumbing',
    sub_category: 'Motor & water pump repair, Water heater & geyser service',
    district: 'Idukki',
    city: 'Thodupuzha',
    address: 'Civil Station, Painavu, Idukki, Kerala - 685603',
    lat: 9.8510,
    lon: 76.9790,
    exp: 7,
    bio: 'Expert water motor technician and plumber across Idukki district.'
  }
];

async function seedDistrictPros() {
  const client = await pool.connect();
  try {
    console.log('Seeding verified professionals across Kerala districts...');
    const defaultPasswordHash = await bcrypt.hash('Pro@1234', 10);

    for (const pro of DISTRICT_PROS) {
      let userRes = await client.query('SELECT id FROM users WHERE email = $1', [pro.email]);
      let userId;
      if (userRes.rows.length === 0) {
        const u = await client.query(
          `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3) RETURNING id`,
          [pro.name, pro.email, defaultPasswordHash]
        );
        userId = u.rows[0].id;
      } else {
        userId = userRes.rows[0].id;
      }

      let proRes = await client.query('SELECT id FROM professionals WHERE user_id = $1', [userId]);
      if (proRes.rows.length === 0) {
        await client.query(
          `INSERT INTO professionals (
            user_id, full_name, category, sub_category, district, city, state, address,
            registered_latitude, registered_longitude, current_latitude, current_longitude,
            experience_years, bio, is_online, verification_status, password_hash
          ) VALUES ($1, $2, $3, $4, $5, $6, 'Kerala', $7, $8, $9, $8, $9, $10, $11, true, 'verified', $12)`,
          [
            userId, pro.name, pro.category, pro.sub_category, pro.district, pro.city, pro.address,
            pro.lat, pro.lon, pro.exp, pro.bio, defaultPasswordHash
          ]
        );
        console.log(`+ Added verified pro in ${pro.district}: ${pro.name}`);
      } else {
        await client.query(
          `UPDATE professionals 
           SET district = $1, city = $2, state = 'Kerala', address = $3,
               registered_latitude = $4, registered_longitude = $5,
               current_latitude = $4, current_longitude = $5,
               experience_years = $6, bio = $7, is_online = true, verification_status = 'verified'
           WHERE id = $8`,
          [pro.district, pro.city, pro.address, pro.lat, pro.lon, pro.exp, pro.bio, proRes.rows[0].id]
        );
        console.log(`✓ Updated verified pro in ${pro.district}: ${pro.name}`);
      }
    }
    console.log('District professionals seeding completed successfully!');
  } catch (err) {
    console.error('Seeding error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

seedDistrictPros();
