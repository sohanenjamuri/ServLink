const express = require('express');
const router = express.Router();
const { getBookings, createBooking, cancelBooking, updateBookingStatus } = require('../controllers/bookingController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(protect, getBookings).post(protect, createBooking);
router.put('/:id/cancel', protect, cancelBooking);
router.put('/:id/status', protect, updateBookingStatus);

module.exports = router;
