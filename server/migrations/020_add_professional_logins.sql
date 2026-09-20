-- Migration 020: Create professional_logins table to track professional login history and active online status
CREATE TABLE IF NOT EXISTS professional_logins (
    id SERIAL PRIMARY KEY,
    professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    login_time TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ip_address VARCHAR(100),
    user_agent TEXT,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    logout_time TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_professional_logins_pro_id ON professional_logins(professional_id);
CREATE INDEX IF NOT EXISTS idx_professional_logins_active ON professional_logins(professional_id, is_active);
