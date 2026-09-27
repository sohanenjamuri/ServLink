const Booking = require('../models/Booking');
const Review = require('../models/Review');
const User = require('../models/User');

exports.getProviderReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ provider: req.params.providerId })
      .populate('customer', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createReview = async (req, res) => {
  try {
    if (req.user.role !== 'customer') {
      return res.status(403).json({ message: 'Only customers can write reviews' });
    }

    const { rating, comment } = req.body;
    const numericRating = Number(rating);
    if (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5) {
      return res.status(400).json({ message: 'Rating must be a whole number from 1 to 5' });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: 'A review comment is required' });
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user._id,
      status: 'completed',
    });
    if (!booking) {
      return res.status(400).json({ message: 'You can review a provider only after completing a booking' });
    }

    const existingReview = await Review.findOne({ booking: booking._id });
    if (existingReview) {
      return res.status(409).json({ message: 'You have already reviewed this booking' });
    }

    const review = await Review.create({
      booking: booking._id,
      customer: req.user._id,
      provider: booking.provider,
      rating: numericRating,
      comment: comment.trim(),
    });

    const providerReviews = await Review.find({ provider: booking.provider }).select('rating');
    const ratingTotal = providerReviews.reduce((sum, item) => sum + item.rating, 0);
    await User.findByIdAndUpdate(booking.provider, {
      rating: Number((ratingTotal / providerReviews.length).toFixed(1)),
      reviews: providerReviews.length,
    });

    const populated = await Review.findById(review._id).populate('customer', 'name');
    res.status(201).json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
