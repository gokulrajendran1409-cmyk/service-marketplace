-- Store optional evidence files attached to a customer service request.
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS photo_urls TEXT[] NOT NULL DEFAULT '{}',
ADD COLUMN IF NOT EXISTS video_url TEXT,
ADD COLUMN IF NOT EXISTS voice_url TEXT;
