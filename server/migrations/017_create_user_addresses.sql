-- Create user_addresses table for multi-address management (home, work, other)
CREATE TABLE IF NOT EXISTS user_addresses (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    address_type VARCHAR(50) NOT NULL DEFAULT 'home',
    address_line TEXT NOT NULL,
    landmark TEXT,
    city VARCHAR(100) DEFAULT 'Thiruvananthapuram',
    state VARCHAR(100) DEFAULT 'Kerala',
    pincode VARCHAR(20),
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_address_type CHECK (LOWER(address_type) IN ('home', 'work', 'other'))
);

CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id);
