const db = require('../db');

/**
 * Checks if the service request was done by a referred professional.
 * If yes, calculates 2% commission and records into provider_referral_commissions table.
 * Also checks referrer's monthly completed jobs to set status ('eligible' if >= 15 else 'pending').
 */
async function recordReferralCommission(requestId, client = db) {
    try {
        if (!requestId) return null;

        // 1. Get request details, wage, and the professional who fulfilled it
        const reqQuery = `
            SELECT sr.id, sr.wage, sr.status, sr.updated_at, so.professional_id
            FROM service_requests sr
            JOIN service_offers so ON sr.id = so.request_id AND so.status = 'accepted'
            WHERE sr.id = $1
            LIMIT 1
        `;
        const reqRes = await client.query(reqQuery, [requestId]);
        if (!reqRes.rows.length) return null;

        const reqData = reqRes.rows[0];
        const wage = Number(reqData.wage || 0);
        const proId = reqData.professional_id;

        if (wage <= 0 || !proId) return null;

        // 2. Check if this professional has a referrer (referred_by_id)
        const proRes = await client.query(
            `SELECT id, full_name, referred_by_id FROM professionals WHERE id = $1`,
            [proId]
        );
        if (!proRes.rows.length) return null;

        const referrerId = proRes.rows[0].referred_by_id;
        if (!referrerId) return null; // No referrer, nothing to record

        // 3. Determine month_year (e.g., '2026-11')
        const completionDate = reqData.updated_at ? new Date(reqData.updated_at) : new Date();
        const monthYear = `${completionDate.getFullYear()}-${String(completionDate.getMonth() + 1).padStart(2, '0')}`;

        // 4. Calculate 2% commission
        const commissionRate = 2.00;
        const commissionAmount = Number(((wage * commissionRate) / 100).toFixed(2));

        // 5. Check how many completed works the referrer has done in this month_year
        const referrerMonthlyCountQuery = `
            SELECT COUNT(*)::int as count
            FROM service_requests sr
            JOIN service_offers so ON sr.id = so.request_id AND so.status = 'accepted'
            WHERE so.professional_id = $1
              AND (sr.status = 'completed' OR sr.payment_status = 'paid')
              AND TO_CHAR(sr.updated_at, 'YYYY-MM') = $2
        `;
        const refCountRes = await client.query(referrerMonthlyCountQuery, [referrerId, monthYear]);
        const referrerMonthlyJobs = Number(refCountRes.rows[0]?.count || 0);

        // Status is 'eligible' if monthly jobs >= 15, otherwise 'pending'
        const status = referrerMonthlyJobs >= 15 ? 'eligible' : 'pending';

        // 6. Check if referral commission already recorded for this request_id
        const existingCheck = await client.query(
            `SELECT id FROM provider_referral_commissions WHERE request_id = $1`,
            [requestId]
        );

        if (existingCheck.rows.length > 0) {
            // Update existing
            const updateRes = await client.query(`
                UPDATE provider_referral_commissions
                SET service_wage = $1,
                    commission_amount = $2,
                    month_year = $3,
                    status = $4,
                    updated_at = CURRENT_TIMESTAMP
                WHERE request_id = $5
                RETURNING *
            `, [wage, commissionAmount, monthYear, status, requestId]);
            return updateRes.rows[0];
        } else {
            // Insert new
            const insertRes = await client.query(`
                INSERT INTO provider_referral_commissions 
                (referrer_id, referred_pro_id, request_id, service_wage, commission_rate, commission_amount, month_year, status)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                RETURNING *
            `, [referrerId, proId, requestId, wage, commissionRate, commissionAmount, monthYear, status]);
            return insertRes.rows[0];
        }
    } catch (err) {
        console.error('Error in recordReferralCommission:', err);
        return null;
    }
}

/**
 * Sync / update commission statuses for a referrer when their monthly completed jobs change.
 * If referrer reaches >= 15 jobs, all their 'pending' commissions for that month become 'eligible'.
 */
async function syncReferrerEligibility(referrerId, client = db) {
    try {
        if (!referrerId) return;

        const currentMonth = new Date().toISOString().slice(0, 7); // 'YYYY-MM'

        const referrerMonthlyCountQuery = `
            SELECT COUNT(*)::int as count
            FROM service_requests sr
            JOIN service_offers so ON sr.id = so.request_id AND so.status = 'accepted'
            WHERE so.professional_id = $1
              AND (sr.status = 'completed' OR sr.payment_status = 'paid')
              AND TO_CHAR(sr.updated_at, 'YYYY-MM') = $2
        `;
        const refCountRes = await client.query(referrerMonthlyCountQuery, [referrerId, currentMonth]);
        const count = Number(refCountRes.rows[0]?.count || 0);

        if (count >= 15) {
            // Mark all pending as eligible for this month
            await client.query(`
                UPDATE provider_referral_commissions
                SET status = 'eligible', updated_at = CURRENT_TIMESTAMP
                WHERE referrer_id = $1 AND month_year = $2 AND status = 'pending'
            `, [referrerId, currentMonth]);
        }
    } catch (err) {
        console.error('Error syncing referrer eligibility:', err);
    }
}

module.exports = {
    recordReferralCommission,
    syncReferrerEligibility
};
