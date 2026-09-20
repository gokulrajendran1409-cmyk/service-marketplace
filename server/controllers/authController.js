const pool = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_WEB_CLIENT_ID ||
    '215103121223-i90tgh8pdlcug4ft1ij78i67h5go75es.apps.googleusercontent.com';
const GOOGLE_ANDROID_CLIENT_ID = process.env.GOOGLE_ANDROID_CLIENT_ID ||
    '215103121223-13hgcip8sqh5bnj2g9vvc6hhrs3g4bl1.apps.googleusercontent.com';

const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);
exports.register = async (req, res) => {
    try {
        const { name, email, phone, password } = req.body;

        if (!name || !email || !phone || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const existing = await pool.query('SELECT id FROM users WHERE email = $1 OR phone = $2', [email.trim().toLowerCase(), phone.trim()]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ message: 'User with this email or phone already exists' });
        }

        // Determine profile photo URL
        let profilePhoto = null;
        if (req.file) {
            profilePhoto = `/uploads/${req.file.filename}`;
        } else if (req.body.profile_photo && typeof req.body.profile_photo === 'string') {
            profilePhoto = req.body.profile_photo.trim();
        }

        // Hash password
        const passwordHash = await bcrypt.hash(password, 10);

        // Ensure column exists
        try {
            await pool.query('ALTER TABLE users ADD COLUMN IF NOT EXISTS profile_photo TEXT');
        } catch (_) {}

        // Insert user
        const result = await pool.query(
            `INSERT INTO users (name, email, phone, password_hash, profile_photo)
             VALUES ($1, $2, $3, $4, $5) RETURNING id, name, email, phone, profile_photo`,
            [name.trim(), email.trim().toLowerCase(), phone.trim(), passwordHash, profilePhoto]
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
            audience: [GOOGLE_CLIENT_ID, GOOGLE_ANDROID_CLIENT_ID]
        });

        const payload = ticket.getPayload();

        const email = payload.email;
        const name = payload.name || 'Google User';

        if (!email || payload.email_verified !== true) {
            return res.status(400).json({
                message: 'Google account email could not be verified'
            });
        }

        // Check existing user
        let result = await pool.query(
            'SELECT id, name, email, phone, profile_photo FROM users WHERE email = $1',
            [email]
        );

        let user;

        if (result.rows.length > 0) {
            user = result.rows[0];
            // If user has no profile photo but Google provides one, optionally update it
            if (!user.profile_photo && payload.picture) {
                try {
                    await pool.query('UPDATE users SET profile_photo = $1 WHERE id = $2', [payload.picture, user.id]);
                    user.profile_photo = payload.picture;
                } catch (_) {}
            }
        } else {
            // Create new Google user
            result = await pool.query(
                `INSERT INTO users (name, email, phone, password_hash, profile_photo)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING id, name, email, phone, profile_photo`,
                [name, email, `g${payload.sub.slice(-19)}`, `google-${payload.sub}`, payload.picture || null]
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
        const isGoogleTokenError = error.message?.includes('Wrong number of segments')
            || error.message?.includes('Invalid token')
            || error.message?.includes('Wrong audience')
            || error.message?.includes('Token used too late')
            || error.message?.includes('Token used too early');

        res.status(isGoogleTokenError ? 401 : 500).json({
            message: isGoogleTokenError ? 'Google token verification failed' : 'Google login could not be completed'
        });
    }
};