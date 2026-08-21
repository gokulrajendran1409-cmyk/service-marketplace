-- Store the customer's coordinates so professionals can calculate distance after reload.
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS longitude NUMERIC(10, 7);
