-- Migration 020: Add OTP verified flag and timestamp to service_requests
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS is_otp_verified BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE service_requests ADD COLUMN IF NOT EXISTS otp_verified_at TIMESTAMP WITH TIME ZONE;

-- Backfill any existing in-progress or completed requests where OTP was already verified
UPDATE service_requests
SET is_otp_verified = TRUE,
    otp_verified_at = COALESCE(journey_updated_at, updated_at, CURRENT_TIMESTAMP)
WHERE journey_status IN ('arrived', 'working', 'awaiting_payment', 'completed');
