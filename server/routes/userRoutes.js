const express = require('express');
const router = express.Router();
const { getCategories, getProfessionals, createRequest, getMyRequests } = require('../controllers/userController');
const { protectCustomer } = require('../middleware/authMiddleware');

router.get('/categories', getCategories);
router.get('/professionals', getProfessionals);
router.post('/requests', protectCustomer, createRequest);
router.get('/requests', protectCustomer, getMyRequests);

module.exports = router;
