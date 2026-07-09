const express = require('express');
const router = express.Router();
const requestController = require('../controllers/requestController');

router.post('/', requestController.createRequest);
router.get('/', requestController.getNearbyRequests);
router.get('/customer', requestController.getCustomerRequests);

module.exports = router;
