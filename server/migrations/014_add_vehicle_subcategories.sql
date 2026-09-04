-- Insert 11 Vehicle Services subcategories into categories table
INSERT INTO categories (name, description, created_at, updated_at)
VALUES 
  ('Vehicle Servicing', 'Periodic vehicle maintenance, engine oil change and multi-point servicing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Service Booking', 'Scheduled vehicle service appointments with doorstep or workshop pickup', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Car Wash & Detailing', 'Doorstep foam wash, interior deep cleaning, ceramic coating and polishing', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Inspection & Vehicle Diagnosis', '50-point vehicle diagnostic check, OBD-II scanner tests and inspection', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Tyres & Wheels', 'Wheel alignment, balancing, doorstep puncture repair and tyre replacement', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Battery Services', 'Emergency jumpstart, battery health diagnostics and doorstep battery replacement', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('AC & Climate Services', 'Air conditioning gas recharge, cooling coil cleaning and cabin filter replacement', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Parts & Accessories', 'Genuine spare parts, filters, wiper blades, lights, dashcams and accessories', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Roadside Assistance', '24x7 emergency breakdown help, towing, flat tyre and emergency fuel delivery', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Find Service Centers', 'Authorized and multi-brand workshop network with distance and ratings', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('Insurance', 'Motor insurance quote comparison, instant policy renewal and cashless claims', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (name) DO UPDATE 
SET description = EXCLUDED.description, updated_at = CURRENT_TIMESTAMP;
