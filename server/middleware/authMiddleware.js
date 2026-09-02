const jwt = require('jsonwebtoken');
const db = require('../config/database');

const JWT_SECRET = process.env.JWT_SECRET || 'super_secret_jwt_key_for_demo';

exports.protect = (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (!token && req.query && typeof req.query.token === 'string' && req.query.token.length > 0) {
        token = req.query.token;
        delete req.query.token;
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
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
