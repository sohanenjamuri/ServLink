const Booking = require('../models/Booking');
const Review = require('../models/Review');

exports.getBookings = async (req, res) => {
  try {
    const filter = req.user.role === 'provider' ? { provider: req.user._id } : { customer: req.user._id };
    const bookings = await Booking.find(filter)
      .populate('provider', 'name category')
      .populate('customer', 'name email')
      .sort({ createdAt: -1 });
    const reviews = await Review.find({ booking: { $in: bookings.map((booking) => booking._id) } }).select('booking');
    const reviewedBookings = new Set(reviews.map((review) => review.booking.toString()));
    res.json(bookings.map((booking) => ({
      ...booking.toObject(),
      reviewed: reviewedBookings.has(booking._id.toString()),
    })));
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createBooking = async (req, res) => {
  try {
    const { provider, service, serviceName, date, time, price } = req.body;
    const booking = new Booking({
      customer: req.user._id,
      provider,
      service,
      serviceName,
      date,
      time,
      price,
      status: 'pending'
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    const isCustomer = booking.customer.toString() === req.user._id.toString();
    const isProvider = booking.provider.toString() === req.user._id.toString();
    if (!isCustomer && !isProvider) {
      return res.status(403).json({ message: 'Not authorized to cancel this booking' });
    }
    if (booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }
    booking.status = 'cancelled';
    await booking.save();
    res.json(booking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const allowed = ['confirmed', 'completed', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });
    if (booking.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this booking' });
    }

    if (status === 'confirmed' && booking.status !== 'pending') {
      return res.status(400).json({ message: 'Only pending bookings can be confirmed' });
    }
    if (status === 'completed' && booking.status !== 'confirmed') {
      return res.status(400).json({ message: 'Only confirmed bookings can be marked completed' });
    }
    if (status === 'cancelled' && booking.status === 'completed') {
      return res.status(400).json({ message: 'Completed bookings cannot be cancelled' });
    }

    booking.status = status;
    await booking.save();
    const populated = await Booking.findById(booking._id)
      .populate('provider', 'name category')
      .populate('customer', 'name email');
    res.json(populated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
