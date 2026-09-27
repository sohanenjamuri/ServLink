const Service = require('../models/Service');

exports.getServices = async (req, res) => {
  try {
    const { provider } = req.query;
    const query = {};
    if (provider) query.provider = provider;
    const services = await Service.find(query).populate('provider', 'name location rating');
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id).populate('provider', 'name location rating');
    if (service) {
      res.json(service);
    } else {
      res.status(404).json({ message: 'Service not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyServices = async (req, res) => {
  try {
    const services = await Service.find({ provider: req.user._id }).sort({ createdAt: -1 });
    res.json(services);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    if (req.user.role !== 'provider') {
      return res.status(403).json({ message: 'Only providers can create services' });
    }
    const { name, category, price, description } = req.body;
    if (!name || !category || !price) {
      return res.status(400).json({ message: 'Name, category, and price are required' });
    }
    const service = new Service({
      name,
      category,
      price: String(price).startsWith('$') ? String(price) : `$${price}`,
      description: description || '',
      provider: req.user._id
    });

    const createdService = await service.save();
    res.status(201).json(createdService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to update this service' });
    }

    const { name, category, price, description } = req.body;
    if (name) service.name = name;
    if (category) service.category = category;
    if (price) service.price = String(price).startsWith('$') ? String(price) : `$${price}`;
    if (description !== undefined) service.description = description;

    const updated = await service.save();
    res.json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) return res.status(404).json({ message: 'Service not found' });
    if (service.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this service' });
    }
    await service.deleteOne();
    res.json({ message: 'Service deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
