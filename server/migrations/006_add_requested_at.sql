-- Store the customer's preferred service date and time.
ALTER TABLE service_requests
ADD COLUMN IF NOT EXISTS requested_at TIMESTAMPTZ;
