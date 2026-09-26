const express = require('express');
const router = express.Router();
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const validate = require('../middleware/validate');
const { protect } = require('../middleware/authMiddleware');
const { registerSchema, loginSchema } = require('../validations/auth');
const {
    register,
    login,
    googleLogin
} = require('../controllers/authController');
const {
    sendEmailOtp,
    verifyEmailOtp,
    sendPhoneOtp,
    verifyPhoneOtp,
    getVerificationStatus
} = require('../controllers/verificationController');

if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads');
}

// Multer implementation handles phase 16 file upload checks
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'),
    filename: (req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`;
        const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
        cb(null, `user-${uniqueSuffix}-${cleanName}`);
    }
});
const fileFilter = (req, file, cb) => {
    // Only allow images
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Not an image! Please upload an image.'), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

router.post('/google', googleLogin);
// The validate middleware intercepts requests and applies zod schemas
router.post('/register', upload.single('profile_photo'), validate(registerSchema), register);
router.post('/login', validate(loginSchema), login);

// Verification Routes
router.post('/email/send-otp', protect, sendEmailOtp);
router.post('/email/verify-otp', protect, verifyEmailOtp);
router.post('/phone/send-otp', protect, sendPhoneOtp);
router.post('/phone/verify-otp', protect, verifyPhoneOtp);
router.get('/verification-status', protect, getVerificationStatus);

module.exports = router;
