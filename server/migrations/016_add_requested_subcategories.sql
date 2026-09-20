-- Migration 016: Add requested categories and subcategories (excluding deleted categories)

-- 1. Ensure new/requested categories exist
INSERT INTO categories (name, description)
VALUES 
  ('AC & Appliances', 'Expert repair, servicing, and installation of air conditioners and home appliances'),
  ('Cleaning', 'Deep cleaning, sanitization, and routine housekeeping services'),
  ('Pest Control', 'Complete pest eradication for cockroaches, termites, mosquitoes, rodents, and insects'),
  ('Home Improvement', 'Painting, wall repair, tile work, waterproofing, wallpaper, and false ceiling solutions'),
  ('Vehicle', 'Doorstep bike & car repair, detailing, wash, battery jumpstart, and tyre service'),
  ('Personal & Daily Help', 'Barbers, beauty care, home tutors, cooks, babysitters, elder care, and drivers')
ON CONFLICT (name) DO NOTHING;

-- 2. Insert requested subcategories avoiding duplicates
INSERT INTO subcategories (category_id, category_name, name, image_url, price_estimate, created_at, updated_at)
SELECT c.id, d.cat_name, d.sub_name, d.img, d.price, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
FROM (
  VALUES
  -- 1. AC & Appliances
  ('AC & Appliances', 'AC service', 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('AC & Appliances', 'AC repair', 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?auto=format&fit=crop&w=600&q=80', 'From ₹399'),
  ('AC & Appliances', 'Refrigerator', 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('AC & Appliances', 'Washing machine', 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('AC & Appliances', 'Microwave', 'https://images.unsplash.com/photo-1585659722983-3a675dabf23d?auto=format&fit=crop&w=600&q=80', 'From ₹299'),
  ('AC & Appliances', 'Geyser', 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=600&q=80', 'From ₹299'),
  ('AC & Appliances', 'TV', 'https://images.unsplash.com/photo-1593784991095-a205069470b6?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('AC & Appliances', 'RO/water purifier', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From ₹299'),

  -- 2. Cleaning
  ('Cleaning', 'Full house cleaning', 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=600&q=80', 'From ₹999'),
  ('Cleaning', 'Bathroom cleaning', 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('Cleaning', 'Kitchen cleaning', 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Cleaning', 'Sofa cleaning', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?auto=format&fit=crop&w=600&q=80', 'From ₹399'),
  ('Cleaning', 'Carpet cleaning', 'https://images.unsplash.com/photo-1527515637462-cff94eecc1ac?auto=format&fit=crop&w=600&q=80', 'From ₹299'),
  ('Cleaning', 'Move-in/move-out cleaning', 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=600&q=80', 'From ₹1,299'),

  -- 3. Pest Control
  ('Pest Control', 'Cockroach', 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Pest Control', 'Termite', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', 'From ₹1,199'),
  ('Pest Control', 'Mosquito', 'https://images.unsplash.com/photo-1592417817098-8f3d6eb225cc?auto=format&fit=crop&w=600&q=80', 'From ₹599'),
  ('Pest Control', 'Rodent', 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Pest Control', 'General pest control', 'https://images.unsplash.com/photo-1584820927498-cfe5211fd8bf?auto=format&fit=crop&w=600&q=80', 'From ₹799'),

  -- 4. Home Improvement
  ('Home Improvement', 'Painting', 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=600&q=80', 'From ₹1,499'),
  ('Home Improvement', 'Wall repair', 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=600&q=80', 'From ₹399'),
  ('Home Improvement', 'Tile work', 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Home Improvement', 'Waterproofing', 'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=600&q=80', 'From ₹899'),
  ('Home Improvement', 'Wallpaper', 'https://images.unsplash.com/photo-1615529182904-14819c35db37?auto=format&fit=crop&w=600&q=80', 'From ₹599'),
  ('Home Improvement', 'False ceiling', 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80', 'From ₹1,999'),

  -- 5. Vehicle
  ('Vehicle', 'Bike mechanic', 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=600&q=80', 'From ₹199'),
  ('Vehicle', 'Car mechanic', 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=600&q=80', 'From ₹499'),
  ('Vehicle', 'Car wash/detailing', 'https://images.unsplash.com/photo-1601362840469-51e4d8d58785?auto=format&fit=crop&w=600&q=80', 'From ₹349'),
  ('Vehicle', 'Battery/jump-start', 'https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?auto=format&fit=crop&w=600&q=80', 'From ₹199'),
  ('Vehicle', 'Tyre/puncture service', 'https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=600&q=80', 'From ₹149'),

  -- 6. Personal & Daily Help
  ('Personal & Daily Help', 'Barber', 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=600&q=80', 'From ₹149'),
  ('Personal & Daily Help', 'Beauty services', 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=600&q=80', 'From ₹299'),
  ('Personal & Daily Help', 'Home tutor', 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=600&q=80', 'From ₹399 / hr'),
  ('Personal & Daily Help', 'Cook', 'https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&w=600&q=80', 'From ₹299 / meal'),
  ('Personal & Daily Help', 'Elder care', 'https://images.unsplash.com/photo-1576765608535-5f04d1e3f289?auto=format&fit=crop&w=600&q=80', 'From ₹499 / day'),
  ('Personal & Daily Help', 'Babysitter', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=600&q=80', 'From ₹399 / day'),
  ('Personal & Daily Help', 'Driver', 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=600&q=80', 'From ₹299 / hr')
) AS d(cat_name, sub_name, img, price)
JOIN categories c ON LOWER(c.name) = LOWER(d.cat_name)
ON CONFLICT (category_name, name) DO NOTHING;
