const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    } else if (req.query.token) {
        // Support token in query parameter for EventSource (SSE doesn't support custom headers)
        token = req.query.token;
        console.log('📨 Token from query params:', token.substring(0, 20) + '...');
    }

    if (!token) {
        console.error('❌ No token provided');
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        console.log('🔐 Verifying token with secret...');
        const decoded = jwt.verify(token, JWT_SECRET);
        console.log('✅ Token verified:', decoded);
        req.user = decoded; // { id, role, ... }
        next();
    } catch (error) {
        console.error('❌ Token verification failed:', error.message);
        res.status(401).json({ message: 'Not authorized, token failed' });
    }
};

exports.protectProfessional = (req, res, next) => {
    exports.protect(req, res, async () => {
        if (req.user.role !== 'professional' || !req.user.professionalId) {
            return res.status(403).json({ message: 'Professional access required' });
        }
        try {
            const result = await db.query(
                'SELECT verification_status FROM professionals WHERE id = $1 AND user_id = $2',
                [req.user.professionalId, req.user.id]
            );
            const professional = result.rows[0];
            if (!professional) {
                return res.status(403).json({ message: 'Professional account not found' });
            }
            if (professional.verification_status !== 'verified') {
                return res.status(403).json({
                    message: professional.verification_status === 'rejected'
                        ? 'Your professional registration was rejected. Please contact support.'
                        : 'Your professional registration is awaiting admin approval.'
                });
            }
            req.professionalId = req.user.professionalId;
            next();
        } catch (error) {
            console.error('Professional verification error:', error);
            res.status(500).json({ message: 'Unable to verify professional access' });
        }
    });
};

exports.protectCustomer = (req, res, next) => {
    exports.protect(req, res, () => {
        if (req.user.role !== 'customer') {
            return res.status(403).json({ message: 'Customer access required' });
        }
        next();
    });
};
