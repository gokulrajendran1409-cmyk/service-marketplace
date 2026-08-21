-- Store the professional's latest verified location for accepted customer requests.
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS current_latitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS current_longitude NUMERIC(10, 7),
ADD COLUMN IF NOT EXISTS location_updated_at TIMESTAMPTZ;
