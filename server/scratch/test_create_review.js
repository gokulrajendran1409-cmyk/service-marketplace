const pool = require('../config/database');

(async () => {
  try {
    const eligible = await pool.query(`
      SELECT sr.id, sr.status, sr.payment_status, sr.customer_id,
        accepted_offer.professional_id,
        (SELECT id FROM professional_reviews WHERE request_id = sr.id) AS existing_review
      FROM service_requests sr
      JOIN LATERAL (
        SELECT professional_id FROM service_offers
        WHERE request_id = sr.id AND status = 'accepted' LIMIT 1
      ) accepted_offer ON true
      WHERE sr.payment_status = 'paid'
      ORDER BY sr.id DESC
      LIMIT 10
    `);
    console.log('eligible for review:', eligible.rows);

    const unpaid = await pool.query(`
      SELECT sr.id, sr.status, sr.payment_status,
        (SELECT status FROM service_offers WHERE request_id = sr.id LIMIT 1) AS offer_status
      FROM service_requests sr
      WHERE sr.payment_status != 'paid' AND sr.status = 'completed'
      LIMIT 5
    `);
    console.log('completed but unpaid:', unpaid.rows);
  } catch (err) {
    console.error('ERR:', err.message);
  } finally {
    await pool.end();
  }
})();
