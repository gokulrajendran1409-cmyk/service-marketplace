const pool = require('../config/database');

(async () => {
  try {
    const reviews = await pool.query(`
      SELECT r.id, r.rating, r.comment, r.created_at,
             u.name AS customer_name, p.full_name AS professional_name, p.category
      FROM professional_reviews r
      JOIN professionals p ON p.id = r.professional_id
      JOIN users u ON u.id = r.customer_id
      ORDER BY r.created_at DESC
      LIMIT 10
    `);
    console.log('recent reviews:', reviews.rows);

    const byCategory = await pool.query(`
      SELECT p.category, COUNT(*)::int AS count, ROUND(AVG(r.rating)::numeric,1) AS avg
      FROM professional_reviews r
      JOIN professionals p ON p.id = r.professional_id
      GROUP BY p.category
      ORDER BY count DESC
    `);
    console.log('reviews by category:', byCategory.rows);

    const plumbing = await pool.query(`
      SELECT r.rating, r.comment, u.name AS customer_name, p.full_name AS professional_name
      FROM professional_reviews r
      JOIN professionals p ON p.id = r.professional_id
      JOIN users u ON u.id = r.customer_id
      WHERE p.category = 'Plumbing' AND p.verification_status = 'verified'
      ORDER BY r.created_at DESC LIMIT 5
    `);
    console.log('plumbing reviews:', plumbing.rows);
  } catch (err) {
    console.error('ERR:', err.message);
  } finally {
    await pool.end();
  }
})();
