-- Add missing columns for professional profile setup
ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS profile_photo TEXT,
ADD COLUMN IF NOT EXISTS sub_category VARCHAR(255),
ADD COLUMN IF NOT EXISTS transport_mode VARCHAR(50),
ADD COLUMN IF NOT EXISTS identity_type VARCHAR(50),
ADD COLUMN IF NOT EXISTS identity_photo TEXT;
