-- Migration 021: Add price_estimate to categories table if not present, and populate initial estimates
ALTER TABLE categories ADD COLUMN IF NOT EXISTS price_estimate VARCHAR(100) DEFAULT 'From ₹299';

-- Populate initial category price estimates from the minimum subcategory price where available
UPDATE categories c
SET price_estimate = sub.min_price
FROM (
    SELECT category_name, MIN(price_estimate) as min_price
    FROM subcategories
    WHERE price_estimate IS NOT NULL AND price_estimate != ''
    GROUP BY category_name
) sub
WHERE LOWER(c.name) = LOWER(sub.category_name) AND (c.price_estimate IS NULL OR c.price_estimate = 'From ₹299');
