-- Migration 022: Add District Pricing Tiers and Cross-District Matching Support

CREATE TABLE IF NOT EXISTS district_pricing_tiers (
    id SERIAL PRIMARY KEY,
    district VARCHAR(100) NOT NULL UNIQUE,
    markup_percentage NUMERIC NOT NULL DEFAULT 0,
    tier_name VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Seed Kerala's 14 districts with the requested dynamic pricing tiers:
-- 1. Tier 1 (Current pricing / 0% markup): Kasaragod, Pathanamthitta, Idukki, Wayanad (and Kannur, Palakkad)
-- 2. Tier 2 (20% increased price): Thrissur, Kollam, Alappuzha, Kottayam, Malappuram
-- 3. Tier 3 (30% increased price): Ernakulam, Thiruvananthapuram, Kozhikode
INSERT INTO district_pricing_tiers (district, markup_percentage, tier_name)
VALUES
    ('Kasaragod', 0, 'Current Pricing (Standard)'),
    ('Pathanamthitta', 0, 'Current Pricing (Standard)'),
    ('Idukki', 0, 'Current Pricing (Standard)'),
    ('Wayanad', 0, 'Current Pricing (Standard)'),
    ('Kannur', 0, 'Current Pricing (Standard)'),
    ('Palakkad', 0, 'Current Pricing (Standard)'),
    ('Thrissur', 20, 'Tier 2 (+20% Surge)'),
    ('Kollam', 20, 'Tier 2 (+20% Surge)'),
    ('Alappuzha', 20, 'Tier 2 (+20% Surge)'),
    ('Kottayam', 20, 'Tier 2 (+20% Surge)'),
    ('Malappuram', 20, 'Tier 2 (+20% Surge)'),
    ('Ernakulam', 30, 'Tier 3 (+30% Surge)'),
    ('Thiruvananthapuram', 30, 'Tier 3 (+30% Surge)'),
    ('Kozhikode', 30, 'Tier 3 (+30% Surge)')
ON CONFLICT (district) DO UPDATE 
SET markup_percentage = EXCLUDED.markup_percentage,
    tier_name = EXCLUDED.tier_name,
    updated_at = CURRENT_TIMESTAMP;

-- Add district and pricing_markup_percentage to service_requests for auditing and historical records
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS district VARCHAR(100);
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS pricing_markup_percentage NUMERIC NOT NULL DEFAULT 0;

-- Add district to professionals for direct, indexed district-based lookups
ALTER TABLE professionals ADD COLUMN IF NOT EXISTS district VARCHAR(100);
CREATE INDEX IF NOT EXISTS idx_professionals_district ON professionals(district);
CREATE INDEX IF NOT EXISTS idx_professionals_category_district ON professionals(category, district);

-- Update existing sample professionals with verified status, district, and coordinates
UPDATE professionals 
SET district = 'Kottayam',
    city = 'Kottayam',
    state = 'Kerala',
    registered_latitude = 9.5916,
    registered_longitude = 76.5222,
    current_latitude = 9.5916,
    current_longitude = 76.5222,
    is_online = true,
    verification_status = 'verified'
WHERE address ILIKE '%Kottayam%' OR id = 15;

UPDATE professionals 
SET district = 'Thiruvananthapuram',
    city = 'Thiruvananthapuram',
    state = 'Kerala',
    registered_latitude = 8.5241,
    registered_longitude = 76.9366,
    current_latitude = 8.5241,
    current_longitude = 76.9366,
    is_online = true,
    verification_status = 'verified'
WHERE id = 17;

UPDATE professionals 
SET district = 'Ernakulam',
    city = 'Kochi',
    state = 'Kerala',
    registered_latitude = 9.9816,
    registered_longitude = 76.2999,
    current_latitude = 9.9816,
    current_longitude = 76.2999,
    is_online = true,
    verification_status = 'verified'
WHERE id = 16;
