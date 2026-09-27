const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'provider', 'admin'], default: 'customer' },
  phone: { type: String, default: '' },
  bio: { type: String, default: '' },
  // Provider specific fields
  category: { type: String },
  location: { type: String },
  verified: { type: Boolean, default: false },
  rating: { type: Number, default: 0 },
  reviews: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

