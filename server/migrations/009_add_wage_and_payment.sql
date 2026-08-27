ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS wage NUMERIC;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS wage_description TEXT;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS payment_status VARCHAR(32) NOT NULL DEFAULT 'unpaid';
