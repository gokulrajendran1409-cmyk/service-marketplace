const pool = require('../config/database');

async function addPersonalCare() {
  try {
    // 1. Insert or ensure 'Personal Care' exists in categories
    const catCheck = await pool.query("SELECT id FROM categories WHERE name = 'Personal Care'");
    let categoryId;
    if (catCheck.rows.length === 0) {
      const insertCat = await pool.query(
        `INSERT INTO categories (name, description, created_at, updated_at)
         VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id`,
        ['Personal Care', 'Professional grooming, barber, hair styling, salon, skin care and beautician services at home or studio.']
      );
      categoryId = insertCat.rows[0].id;
      console.log('Inserted Personal Care category with ID:', categoryId);
    } else {
      categoryId = catCheck.rows[0].id;
      console.log('Personal Care category already exists with ID:', categoryId);
    }

    // 2. Insert subcategories with 'Barber and Beautician Services' as primary
    const subcategories = [
      {
        name: 'Barber and Beautician Services',
        imageUrl: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80',
        price: 'From $15'
      },
      {
        name: "Men's Haircut & Beard Grooming",
        imageUrl: 'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?auto=format&fit=crop&w=600&q=80',
        price: 'From $12'
      },
      {
        name: 'Bridal Makeup & Traditional Styling',
        imageUrl: 'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&w=600&q=80',
        price: 'From $55'
      },
      {
        name: 'Facial, Bleach & Skin Glow Spa',
        imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?auto=format&fit=crop&w=600&q=80',
        price: 'From $22'
      },
      {
        name: 'Hair Spa, Coloring & Keratin Care',
        imageUrl: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?auto=format&fit=crop&w=600&q=80',
        price: 'From $28'
      },
      {
        name: 'Manicure, Pedicure & Nail Art',
        imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?auto=format&fit=crop&w=600&q=80',
        price: 'From $18'
      }
    ];

    for (const sub of subcategories) {
      await pool.query(
        `INSERT INTO subcategories (category_id, category_name, name, image_url, price_estimate, created_at, updated_at)
         VALUES ($1, 'Personal Care', $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT (category_name, name)
         DO UPDATE SET image_url = EXCLUDED.image_url, price_estimate = EXCLUDED.price_estimate, updated_at = CURRENT_TIMESTAMP`,
        [categoryId, sub.name, sub.imageUrl, sub.price]
      );
      console.log('Upserted subcategory:', sub.name);
    }

    const totalCats = await pool.query('SELECT count(*) FROM categories');
    console.log('Total categories:', totalCats.rows[0].count);

    const personalCareSubs = await pool.query("SELECT name, price_estimate FROM subcategories WHERE category_name = 'Personal Care'");
    console.log('Personal Care subcategories:');
    console.table(personalCareSubs.rows);

  } catch (err) {
    console.error('Error inserting Personal Care subcategories:', err);
  } finally {
    await pool.end();
  }
}

addPersonalCare();
