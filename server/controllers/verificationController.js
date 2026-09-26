const VerificationService = require('../services/verificationService');
const pool = require('../config/database');

exports.sendPhoneOtp = async (req, res) => {
    try {
        const { phone } = req.body;
        const userId = req.user.id; // from authMiddleware
        
        const result = await VerificationService.sendPhoneOtp(userId, phone);
        if (result.success) {
            res.json(result);
        } else {
            const status = result.code === 'RESEND_TOO_SOON' ? 429 : 400;
            res.status(status).json(result);
        }
    } catch (error) {
        console.error('Send Phone OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

exports.verifyPhoneOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;
        
        const result = await VerificationService.verifyPhoneOtp(userId, otp);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Verify Phone OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
};

exports.sendEmailOtp = async (req, res) => {
    try {
        const { email } = req.body;
        const userId = req.user.id;
        
        const result = await VerificationService.sendEmailOtp(userId, email);
        if (result.success) {
            res.json(result);
        } else {
            const status = result.code === 'RESEND_TOO_SOON' ? 429 : 400;
            res.status(status).json(result);
        }
    } catch (error) {
        console.error('Send Email OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to send OTP' });
    }
};

exports.verifyEmailOtp = async (req, res) => {
    try {
        const { otp } = req.body;
        const userId = req.user.id;
        
        const result = await VerificationService.verifyEmailOtp(userId, otp);
        if (result.success) {
            res.json(result);
        } else {
            res.status(400).json(result);
        }
    } catch (error) {
        console.error('Verify Email OTP Error:', error);
        res.status(500).json({ success: false, message: 'Failed to verify OTP' });
    }
};

exports.getVerificationStatus = async (req, res) => {
    try {
        const userId = req.user.id;
        
        const { rows } = await pool.query(`
            SELECT email_verified, email_verified_at, phone_verified, phone_verified_at, phone_otp_channel
            FROM users WHERE id = $1
        `, [userId]);
        
        const user = rows[0];
        
        if (!user) {
            return res.status(404).json({ success: false, message: 'User not found' });
        }
        
        res.json({
            success: true,
            verification: {
                email: {
                    verified: user.email_verified,
                    verifiedAt: user.email_verified_at
                },
                phone: {
                    verified: user.phone_verified,
                    verifiedAt: user.phone_verified_at,
                    channel: user.phone_otp_channel
                },
                accountVerified: user.email_verified && user.phone_verified
            }
        });
    } catch (error) {
        console.error('Get Verification Status Error:', error);
        res.status(500).json({ success: false, message: 'Failed to fetch verification status' });
    }
};
