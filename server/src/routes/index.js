const express = require('express');

const router = express.Router();

router.use('/auth', require('./auth.routes'));
router.use('/availability', require('./availability.routes'));
router.use('/event-types', require('./eventTypes.routes'));
router.use('/public', require('./public.routes'));
router.use('/bookings', require('./bookings.routes'));
router.use('/analytics', require('./analytics.routes'));
router.use('/internal', require('./internal.routes'));

module.exports = router;
