-- Store coordinates resolved from the professional's registered service address.
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS registered_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS registered_longitude NUMERIC(10, 7);
