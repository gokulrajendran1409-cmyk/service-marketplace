const pool = require('../config/database');

(async () => {
  const requestId = 58;
  const customerId = 7;
  const rating = 5;
  const comment = 'Test review from script';

  try {
    const result = await pool.query(
      `INSERT INTO professional_reviews (request_id, customer_id, professional_id, rating, comment)
       SELECT sr.id, sr.customer_id, accepted_offer.professional_id, $3, $4
       FROM service_requests sr
       JOIN LATERAL (
         SELECT professional_id FROM service_offers
         WHERE request_id = sr.id AND status = 'accepted' LIMIT 1
       ) accepted_offer ON true
       WHERE sr.id = $1 AND sr.customer_id = $2
         AND sr.payment_status = 'paid'
         AND sr.status = 'completed'
       ON CONFLICT (request_id) DO NOTHING
       RETURNING id, request_id, rating, comment, created_at`,
      [requestId, customerId, rating, comment]
    );
    console.log('insert result:', result.rows);
  } catch (err) {
    console.error('insert error:', err.message);
  } finally {
    await pool.end();
  }
})();
