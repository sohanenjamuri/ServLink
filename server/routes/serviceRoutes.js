const express = require('express');
const router = express.Router();
const {
  getServices,
  getServiceById,
  getMyServices,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

router.route('/').get(getServices).post(protect, createService);
router.get('/mine', protect, getMyServices);
router.route('/:id').get(getServiceById).put(protect, updateService).delete(protect, deleteService);

module.exports = router;
