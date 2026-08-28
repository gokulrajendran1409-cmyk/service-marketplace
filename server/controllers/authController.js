const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID =
    '215103121223-i90tgh8pdlcug4ft1ij78i67h5go75es.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email, phone]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email or phone already exists' });
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password_hash)
             VALUES ($1, $2, $3, $4) RETURNING id, name, email, phone`,
            [name, email, phone, passwordHash]
        );

        const user = result.rows[0];

        // Generate token
        const token = jwt.sign({ id: user.id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Failed to register user' });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Block professionals from logging in via the customer login endpoint
        const profCheck = await pool.query('SELECT id FROM professionals WHERE user_id = $1', [user.id]);
        if (profCheck.rows.length > 0) {
            return res.status(403).json({
                message: 'This account is registered as a professional. Please use the Professional Portal to log in.'
            });
        }

        // Generate token
        const token = jwt.sign({ id: user.id, role: 'customer' }, JWT_SECRET, { expiresIn: '7d' });

        // Remove password hash from response
        delete user.password_hash;

        res.json({
            message: 'Logged in successfully',
            token,
            user
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Failed to login' });
    }
};

exports.googleLogin = async (req, res) => {
    try {
        const { idToken } = req.body;

        if (!idToken) {
            return res.status(400).json({
                message: 'Google ID token is required'
            });
        }

        // Verify token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();

        const email = payload.email;
        const name = payload.name || 'Google User';

        if (!email) {
            return res.status(400).json({
                message: 'Google account email not available'
            });
        }

        // Check existing user
        let result = await pool.query(
            'SELECT id, name, email, phone FROM users WHERE email = $1',
            [email]
        );

        let user;

        if (result.rows.length > 0) {
            user = result.rows[0];
        } else {
            // Create new Google user
            result = await pool.query(
                `INSERT INTO users (name, email, phone, password_hash)
                 VALUES ($1, $2, NULL, NULL)
                 RETURNING id, name, email, phone`,
                [name, email]
            );

            user = result.rows[0];
        }

        // Check professional account
        const profCheck = await pool.query(
            'SELECT id FROM professionals WHERE user_id = $1',
            [user.id]
        );

        if (profCheck.rows.length > 0) {
            return res.status(403).json({
                message: 'This account is registered as a professional.'
            });
        }

        // Generate your own JWT
        const token = jwt.sign(
            {
                id: user.id,
                role: 'customer'
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );

        res.json({
            message: 'Google login successful',
            token,
            user
        });

    } catch (error) {
        console.error('Google login error:', error);

        res.status(401).json({
            message: 'Google authentication failed'
        });
    }
};