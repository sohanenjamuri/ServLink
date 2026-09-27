const User = require('../models/User');

exports.getProviders = async (req, res) => {
  try {
    const providers = await User.find({ role: 'provider' }).select('-password');
    res.json(providers);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProviderById = async (req, res) => {
  try {
    const provider = await User.findOne({ _id: req.params.id, role: 'provider' }).select('-password');
    if (provider) {
      res.json(provider);
    } else {
      res.status(404).json({ message: 'Provider not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
