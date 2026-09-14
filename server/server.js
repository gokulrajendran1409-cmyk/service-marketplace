const express = require("express");
const cors = require("cors");
const adminRoutes = require("./routes/adminRoutes");
const professionalRoutes = require("./routes/professionalRoutes");
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const pool = require("./config/database");

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
    res.json({ message: "Service Marketplace API is running!" });
});

app.use("/api/admin", adminRoutes);
app.use("/api/professionals", professionalRoutes);
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;

async function startServer() {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

    try {
        await pool.query('ALTER TABLE users ALTER COLUMN phone DROP NOT NULL');
        await pool.query('ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL');
    } catch (error) {
        console.error('OAuth user schema initialization failed:', error.message);
    }

    try {
        await pool.query(`
        CREATE TABLE IF NOT EXISTS professional_reviews (
            id SERIAL PRIMARY KEY,
            request_id INTEGER NOT NULL UNIQUE REFERENCES service_requests(id) ON DELETE CASCADE,
            customer_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
            professional_id INTEGER NOT NULL REFERENCES professionals(id) ON DELETE CASCADE,
            rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
            comment TEXT,
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `);
    } catch (error) {
        console.error('Professional reviews table initialization failed:', error.message);
    }

    try {
        await pool.query(`
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
            created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
        `);
        await pool.query(`CREATE INDEX IF NOT EXISTS idx_user_addresses_user_id ON user_addresses(user_id)`);
    } catch (error) {
        console.error('User addresses table initialization failed:', error.message);
    }
}

startServer().catch(error => {
    console.error('Server startup failed:', error.message);
    process.exit(1);
});