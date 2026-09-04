const pool = require('../config/database');

async function addVehicleServices() {
  try {
    // 1. Insert or ensure 'Vehicle Services' exists in categories
    const catCheck = await pool.query("SELECT id FROM categories WHERE name = 'Vehicle Services'");
    let categoryId;
    if (catCheck.rows.length === 0) {
      const insertCat = await pool.query(
        `INSERT INTO categories (name, description, created_at, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Vehicle Services', 'Professional car and two-wheeler servicing, maintenance, diagnostics and roadside emergency repairs.']
      );
      categoryId = insertCat.rows[0].id;
      console.log('Inserted Vehicle Services category with ID:', categoryId);
    } else {
      categoryId = catCheck.rows[0].id;
      console.log('Vehicle Services category already exists with ID:', categoryId);
    }

    // 2. Define the 6 subcategories
    const subcategories = [
      {
        name: 'Periodic Car & Bike Maintenance',
        imageUrl: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80',
        price: 'From $45'
      },
      {
        name: 'Car Spa, Snow Foam Wash & Detailing',
        imageUrl: 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80',
        price: 'From $20'
      },
      {
        name: '24/7 Breakdown SOS, Jumpstart & Towing',
        imageUrl: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80',
        price: 'From $35'
      },
      {
        name: '3D Laser Wheel Alignment & Balancing',
        imageUrl: 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80',
        price: 'From $18'
      },
      {
        name: 'Car AC Gas Recharge & Cooling Repair',
        imageUrl: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80',
        price: 'From $38'
      },
      {
        name: 'Battery Health Test & Jumpstart Service',
        imageUrl: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80',
        price: 'From $25'
      }
    ];

    for (const sub of subcategories) {
      await pool.query(
        `INSERT INTO subcategories (category_id, category_name, name, image_url, price_estimate, created_at, updated_at)
         VALUES ($1, 'Vehicle Services', $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (category_name, name)
         DO UPDATE SET image_url = EXCLUDED.image_url, price_estimate = EXCLUDED.price_estimate, updated_at = CURRENT_TIMESTAMP`,
        [categoryId, sub.name, sub.imageUrl, sub.price]
      );
      console.log('Upserted subcategory:', sub.name);
    }

    const totalCats = await pool.query('SELECT count(*) FROM categories');
    console.log('Total categories:', totalCats.rows[0].count);

    const totalSubs = await pool.query('SELECT count(*) FROM subcategories');
    console.log('Total subcategories:', totalSubs.rows[0].count);

    const vehicleSubs = await pool.query("SELECT name, price_estimate FROM subcategories WHERE category_name = 'Vehicle Services'");
    console.log('Vehicle Services subcategories:');
    console.table(vehicleSubs.rows);

  } catch (err) {
    console.error('Error inserting Vehicle Services:', err);
  } finally {
    await pool.end();
  }
}

addVehicleServices();
