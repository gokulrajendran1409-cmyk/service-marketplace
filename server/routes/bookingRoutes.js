const express = require('express');
const router = express.Router();
const bookingController = require('../controllers/bookingController');

router.post('/', bookingController.createBooking);
router.get('/customer', bookingController.getCustomerBookings);
router.get('/professional', bookingController.getProfessionalBookings);
router.put('/:id/status', bookingController.updateBookingStatus);

module.exports = router;
