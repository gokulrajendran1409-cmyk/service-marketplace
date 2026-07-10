const express = require('express');
const router = express.Router();
const { verifyToken } = require('../middleware/authMiddleware');
const {
    registerProfessional,
    getProfessionalProfile,
    searchProfessionals,
    getProfessionalById
} = require('../controllers/professionalController');

// Public routes
router.post('/register', registerProfessional);
router.get('/search', searchProfessionals);
router.get('/:id', getProfessionalById);

// Protected routes (requires login)
router.get('/me/profile', verifyToken, getProfessionalProfile);

module.exports = router;
