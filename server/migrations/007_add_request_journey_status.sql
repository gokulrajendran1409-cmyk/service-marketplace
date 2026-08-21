-- Track the professional's travel and work progress separately from the request status.
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS journey_status VARCHAR(32) NOT NULL DEFAULT 'accepted',
ADD COLUMN IF NOT EXISTS journey_updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP;
