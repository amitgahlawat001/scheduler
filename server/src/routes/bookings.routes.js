const express = require('express');
const bookingsController = require('../controllers/bookings.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { noShowSchema } = require('../validators/booking.validators');

const router = express.Router();
router.use(authMiddleware);

router.get('/', bookingsController.listBookings);
router.delete('/:id', bookingsController.cancelBooking);
router.patch('/:id/no-show', validate(noShowSchema), bookingsController.setNoShow);

module.exports = router;
