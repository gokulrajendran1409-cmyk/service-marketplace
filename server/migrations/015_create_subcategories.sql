-- Create subcategories table
CREATE TABLE IF NOT EXISTS subcategories (
  id SERIAL PRIMARY KEY,
  category_id BIGINT REFERENCES categories(id) ON DELETE CASCADE,
  category_name VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  image_url TEXT NOT NULL,
  price_estimate VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT uq_cat_subcat UNIQUE (category_name, name)
);

-- Index for fast lookup by category name
CREATE INDEX IF NOT EXISTS idx_subcategories_category_name ON subcategories(category_name);

-- Helper query to insert subcategories matching parent category id
INSERT INTO subcategories (category_id, category_name, name, image_url, price_estimate, created_at, updated_at)
SELECT c.id, d.cat_name, d.sub_name, d.img, d.price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
  -- 1. Plumbing
  ('Plumbing', 'Pipe Leak & Burst Repair', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', 'From $29'),
  ('Plumbing', 'Tap, Faucet & Shower Mixer Fix', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'From $24'),
  ('Plumbing', 'Drain & Sewer Unclogging', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Plumbing', 'Toilet, Flush & Cistern Repair', 'https://images.unsplash.com/photo-1564540586988-aa4e53c3d799?auto=format&fit=crop&w=600&q=80', 'From $28'),
  ('Plumbing', 'Water Heater & Geyser Service', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'From $42'),
  ('Plumbing', 'Water Tank Cleaning & Sanitization', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From $49'),

  -- 2. Electrical
  ('Electrical', 'Switch, Socket & Dimmer Repair', 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=600&q=80', 'From $19'),
  ('Electrical', 'Ceiling Fan Fitting & Repair', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Electrical', 'Chandelier & Designer Lighting', 'https://images.unsplash.com/photo-1517991104123-1d56a6e81ed9?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Electrical', 'Circuit Breaker & MCB Fuse Box', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', 'From $39'),
  ('Electrical', 'Complete House Rewiring', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80', 'From $85'),
  ('Electrical', 'Inverter & UPS Setup', 'https://images.unsplash.com/photo-1509391365360-2e959784a276?auto=format&fit=crop&w=600&q=80', 'From $45'),

  -- 3. AC & Appliance Repair
  ('AC & Appliance Repair', 'Split AC Jet Foam Cleaning', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80', 'From $39'),
  ('AC & Appliance Repair', 'AC Gas Refill & Leak Diagnosis', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80', 'From $49'),
  ('AC & Appliance Repair', 'Refrigerator Cooling & Defrost Fix', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80', 'From $45'),
  ('AC & Appliance Repair', 'Washing Machine Drum & Motor Fix', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80', 'From $38'),
  ('AC & Appliance Repair', 'Microwave & Oven Repair', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80', 'From $30'),
  ('AC & Appliance Repair', 'RO Water Purifier Filter Service', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From $32'),

  -- 4. Carpentry
  ('Carpentry', 'Furniture Assembly & Flatpack Fitting', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80', 'From $30'),
  ('Carpentry', 'Door Lock, Handle & Hinge Repair', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', 'From $22'),
  ('Carpentry', 'Custom Wooden Cupboard & Shelves', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80', 'From $55'),
  ('Carpentry', 'Modular Kitchen Cabinet Alignment', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Carpentry', 'Bed, Sofa & Table Restoration', 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&w=600&q=80', 'From $40'),
  ('Carpentry', 'Window Mesh & Frame Repair', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80', 'From $25'),

  -- 5. Painting
  ('Painting', 'Interior Living & Bedroom Painting', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', 'From $80'),
  ('Painting', 'Exterior Weatherproof House Paint', 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=600&q=80', 'From $140'),
  ('Painting', 'Waterproofing & Damp Treatment', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80', 'From $60'),
  ('Painting', 'Decorative Accent Wall & Texture', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80', 'From $75'),
  ('Painting', 'Wood Polish, Staining & PU Varnish', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'From $45'),
  ('Painting', 'Metal Grille & Gate Enamel Paint', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', 'From $38'),

  -- 6. Cleaning
  ('Cleaning', 'Basic Express House Cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Cleaning', 'Intensive Home Deep Clean & Scrub', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From $45'),
  ('Cleaning', 'Sofa & Carpet Shampooing', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Cleaning', 'Bathroom Descaling & Sanitizing', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'From $30'),
  ('Cleaning', 'Kitchen Stove, Chimney & Tiles Degrease', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 'From $40'),
  ('Cleaning', 'Move-in / Move-out Turnover Clean', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', 'From $65'),

  -- 7. Home Repair & Maintenance
  ('Home Repair & Maintenance', 'TV Wall Mount & Drilling', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80', 'From $22'),
  ('Home Repair & Maintenance', 'Tile & Grout Replacement', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Home Repair & Maintenance', 'Wall Crack Filling & Plaster Patch', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', 'From $28'),
  ('Home Repair & Maintenance', 'Door & Window Weatherstripping', 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?auto=format&fit=crop&w=600&q=80', 'From $20'),
  ('Home Repair & Maintenance', 'Curtain Rod & Blinds Installation', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Home Repair & Maintenance', 'General All-Round Handyman', 'https://images.unsplash.com/photo-1581783342308-f792dbdd27c5?auto=format&fit=crop&w=600&q=80', 'From $30 / hr'),

  -- 8. CCTV & Security
  ('CCTV & Security', 'HD Dome & Bullet CCTV Installation', 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?auto=format&fit=crop&w=600&q=80', 'From $55'),
  ('CCTV & Security', 'DVR / NVR & Mobile Remote Setup', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80', 'From $40'),
  ('CCTV & Security', 'Smart Video Doorbell Fitting', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('CCTV & Security', 'Biometric & Smart Digital Door Lock', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', 'From $65'),
  ('CCTV & Security', 'Motion Sensor & Alarm System', 'https://images.unsplash.com/photo-1508873696983-2df5703bc20d?auto=format&fit=crop&w=600&q=80', 'From $45'),
  ('CCTV & Security', 'Security Camera Wiring & Repair', 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?auto=format&fit=crop&w=600&q=80', 'From $30'),

  -- 9. Gardening & Landscaping
  ('Gardening & Landscaping', 'Lawn Mowing & Turf Care', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb225cc?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Gardening & Landscaping', 'Garden Weeding & Soil Enrichment', 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=600&q=80', 'From $28'),
  ('Gardening & Landscaping', 'Hedge Trimming & Shrub Shaping', 'https://images.unsplash.com/photo-1558904541-efa8c4a57385?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Gardening & Landscaping', 'Plant Pest & Fungus Control', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', 'From $30'),
  ('Gardening & Landscaping', 'Landscape & Patio Garden Design', 'https://images.unsplash.com/photo-1557429287-b2e26467fc2b?auto=format&fit=crop&w=600&q=80', 'From $90'),
  ('Gardening & Landscaping', 'Automatic Drip Irrigation Setup', 'https://images.unsplash.com/photo-1523301343968-6a6ebf63c672?auto=format&fit=crop&w=600&q=80', 'From $45'),

  -- 10. Computer & Mobile Repair
  ('Computer & Mobile Repair', 'Laptop Screen & Battery Swap', 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=600&q=80', 'From $40'),
  ('Computer & Mobile Repair', 'Virus Removal & OS Reinstallation', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=600&q=80', 'From $30'),
  ('Computer & Mobile Repair', 'Smartphone Screen & Glass Repair', 'https://images.unsplash.com/photo-1596558450255-7c0b7be9d56a?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Computer & Mobile Repair', 'Data Recovery & Hard Drive Backup', 'https://images.unsplash.com/photo-1531492746076-161ca9bcad58?auto=format&fit=crop&w=600&q=80', 'From $50'),
  ('Computer & Mobile Repair', 'RAM & NVMe SSD Storage Upgrade', 'https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Computer & Mobile Repair', 'Wi-Fi Router & Network Setup', 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?auto=format&fit=crop&w=600&q=80', 'From $28'),

  -- 11. Photography & Videography
  ('Photography & Videography', 'Wedding & Engagement Photography', 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=600&q=80', 'From $199'),
  ('Photography & Videography', 'Family & Newborn Studio Portrait', 'https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=600&q=80', 'From $75'),
  ('Photography & Videography', 'E-commerce Product & Brand Shoot', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 'From $85'),
  ('Photography & Videography', '4K Drone Aerial Videography', 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?auto=format&fit=crop&w=600&q=80', 'From $120'),
  ('Photography & Videography', 'Birthday, Gala & Party Coverage', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=600&q=80', 'From $80'),
  ('Photography & Videography', 'Video Editing & Color Grading', 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=600&q=80', 'From $60'),

  -- 12. Vehicle Services
  ('Vehicle Services', 'Periodic Synthetic Oil Service', 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?auto=format&fit=crop&w=600&q=80', 'From $45'),
  ('Vehicle Services', 'Snow Foam Car Spa & Detailing', 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80', 'From $25'),
  ('Vehicle Services', '24/7 Breakdown SOS & Towing', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', 'From $29'),
  ('Vehicle Services', '3D Laser Wheel Alignment', 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80', 'From $15'),
  ('Vehicle Services', 'OBD-II Computer Diagnostics', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 'From $35'),
  ('Vehicle Services', 'Car AC Gas Recharge & Clean', 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=600&q=80', 'From $39')
) AS d(cat_name, sub_name, img, price)
LEFT JOIN categories c ON LOWER(c.name) = LOWER(d.cat_name)
ON CONFLICT (category_name, name) DO UPDATE
SET image_url = EXCLUDED.image_url,
    price_estimate = EXCLUDED.price_estimate,
    category_id = EXCLUDED.category_id,
    updated_at = CURRENT_TIMESTAMP;
