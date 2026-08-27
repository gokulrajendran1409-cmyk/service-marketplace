const express = require('express');
const multer = require('multer');
const fs = require('fs');
const router = express.Router();
const { getCategories, getProfessionals, createRequest, getMyRequests, streamNotifications, confirmPayment, createReview } = require('../controllers/userController');
const { protectCustomer } = require('../middleware/authMiddleware');

if (!fs.existsSync('uploads')) fs.mkdirSync('uploads');
const upload = multer({
	storage: multer.diskStorage({
		destination: 'uploads/',
		filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`)
	}),
	limits: { fileSize: 50 * 1024 * 1024 }
});

router.get('/categories', getCategories);
router.get('/professionals', getProfessionals);
router.post('/requests', protectCustomer, upload.fields([
	{ name: 'photos', maxCount: 5 },
	{ name: 'video', maxCount: 1 },
	{ name: 'voice', maxCount: 1 }
]), createRequest);
router.get('/requests', protectCustomer, getMyRequests);
router.post('/requests/:id/confirm-payment', protectCustomer, confirmPayment);
router.post('/requests/:id/review', protectCustomer, createReview);
router.get('/notifications/stream', protectCustomer, streamNotifications);

module.exports = router;
