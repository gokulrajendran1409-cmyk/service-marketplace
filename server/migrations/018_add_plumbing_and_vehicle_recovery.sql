-- Migration 018: Add Plumbing service category and Vehicle recovery services subcategory

-- 1. Ensure Plumbing category exists
INSERT INTO categories (name, description)
VALUES 
  ('Plumbing', 'Professional plumbing, pipe repairs, leak fixing, tap installation, and drainage solutions')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- 2. Insert Plumbing subcategories and Vehicle recovery services
INSERT INTO subcategories (category_id, category_name, name, image_url, price_estimate, created_at, updated_at)
SELECT c.id, d.cat_name, d.sub_name, d.img, d.price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
  -- Plumbing subcategories
  ('Plumbing', 'Pipe leak & burst repair', 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=600&q=80', 'From ₹249'),
  ('Plumbing', 'Tap, faucet & mixer fix', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'From ₹199'),
  ('Plumbing', 'Drain & sewer unclogging', 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?auto=format&fit=crop&w=600&q=80', 'From ₹299'),
  ('Plumbing', 'Toilet & cistern repair', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('Plumbing', 'Water heater & geyser service', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80', 'From ₹399'),
  ('Plumbing', 'Water tank cleaning & sanitization', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Plumbing', 'Motor & water pump repair', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'From ₹399'),
  ('Plumbing', 'Bathroom & kitchen pipe fitting', 'https://images.unsplash.com/photo-1620626011761-996317b8d101?auto=format&fit=crop&w=600&q=80', 'From ₹299'),

  -- Vehicle subcategory addition
  ('Vehicle', 'Vehicle recovery services', 'https://images.unsplash.com/photo-1580273916550-e323be2ae537?auto=format&fit=crop&w=600&q=80', 'From ₹799')
) AS d(cat_name, sub_name, img, price)
JOIN categories c ON c.name = d.cat_name
ON CONFLICT (category_name, name) DO UPDATE SET 
  image_url = EXCLUDED.image_url,
  price_estimate = EXCLUDED.price_estimate,
  updated_at = CURRENT_TIMESTAMP;
