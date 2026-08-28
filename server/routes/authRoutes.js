const express = require('express');
const router = express.Router();
const {
    register,
    login,
    googleLogin
} = require('../controllers/authController');
router.post('/google', googleLogin);
router.post('/register', register);
router.post('/login', login);

module.exports = router;
