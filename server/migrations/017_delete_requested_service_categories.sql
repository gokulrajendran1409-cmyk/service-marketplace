-- Migration 017: Delete requested service categories and eliminate duplicates

-- 1. Remove services linked to target categories (if table exists)
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'services') THEN
    DELETE FROM services 
    WHERE category_id IN (
      SELECT id FROM categories 
      WHERE LOWER(name) IN (
        'home repair', 
        'home repair & maintenance', 
        'installation & security', 
        'vehicle services', 
        'painting', 
        'ac & appliance repair', 
        'carpentry'
      )
    );
  END IF;
END $$;

-- 2. Remove subcategories linked by category_id or category_name
DELETE FROM subcategories 
WHERE category_id IN (
  SELECT id FROM categories 
  WHERE LOWER(name) IN (
    'home repair', 
    'home repair & maintenance', 
    'installation & security', 
    'vehicle services', 
    'painting', 
    'ac & appliance repair', 
    'carpentry'
  )
)
OR LOWER(category_name) IN (
  'home repair', 
  'home repair & maintenance', 
  'installation & security', 
  'vehicle services', 
  'painting', 
  'ac & appliance repair', 
  'carpentry'
);

-- 3. Remove categories from categories table
DELETE FROM categories 
WHERE LOWER(name) IN (
  'home repair', 
  'home repair & maintenance', 
  'installation & security', 
  'vehicle services', 
  'painting', 
  'ac & appliance repair', 
  'carpentry'
);
