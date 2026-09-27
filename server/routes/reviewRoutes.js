const express = require('express');
const router = express.Router();
const { getProviderReviews, createReview } = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

router.get('/provider/:providerId', getProviderReviews);
router.post('/booking/:bookingId', protect, createReview);

module.exports = router;
