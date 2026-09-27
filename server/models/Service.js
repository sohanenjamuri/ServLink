const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: String, required: true },
  description: { type: String, default: '' },
  rating: { type: Number, default: 0 },
  provider: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
