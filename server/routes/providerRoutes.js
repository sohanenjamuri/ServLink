const express = require('express');
const router = express.Router();
const { getProviders, getProviderById } = require('../controllers/providerController');

router.route('/').get(getProviders);
router.route('/:id').get(getProviderById);

module.exports = router;
