-- Passwords are stored only as bcrypt hashes.
ALTER TABLE users
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);

ALTER TABLE professionals
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
