-- Migration 027: Provider Referral System
-- 1. Add referral_code and referred_by_id to professionals table
ALTER TABLE professionals 
ADD COLUMN IF NOT EXISTS referral_code VARCHAR(20) UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_id INTEGER REFERENCES professionals(id) ON DELETE SET NULL;

-- 2. Populate existing professionals with unique referral codes
DO $$
DECLARE
    pro_rec RECORD;
    new_code VARCHAR(20);
BEGIN
    FOR pro_rec IN SELECT id, full_name FROM professionals WHERE referral_code IS NULL LOOP
        -- Generate code: PRO + 6 random uppercase chars/digits
        new_code := 'PRO' || UPPER(SUBSTRING(MD5(RANDOM()::text || pro_rec.id::text) FROM 1 FOR 6));
        UPDATE professionals SET referral_code = new_code WHERE id = pro_rec.id;
    END LOOP;
END $$;

-- 3. Create provider_referral_commissions table
CREATE TABLE IF NOT EXISTS provider_referral_commissions (
    id SERIAL PRIMARY KEY,
    referrer_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    referred_pro_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    request_id BIGINT REFERENCES service_requests(id) ON DELETE SET NULL,
    service_wage NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    commission_rate NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- 2%
    commission_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    month_year VARCHAR(7) NOT NULL, -- Format: 'YYYY-MM'
    status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' (pending month-end or pending eligibility), 'eligible' (referrer achieved 15 jobs), 'ineligible' (month ended with <15 jobs), 'paid'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_referral_referrer ON provider_referral_commissions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_month ON provider_referral_commissions(month_year);
CREATE INDEX IF NOT EXISTS idx_referral_referred ON provider_referral_commissions(referred_pro_id);
