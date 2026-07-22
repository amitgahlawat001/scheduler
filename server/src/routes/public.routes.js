const express = require('express');
const publicController = require('../controllers/public.controller');
const validate = require('../middleware/validate.middleware');
const { publicLimiter, bookingLimiter } = require('../middleware/rateLimit.middleware');
const { createBookingSchema, rescheduleBookingSchema } = require('../validators/booking.validators');

const router = express.Router();
router.use(publicLimiter);

// Literal /bookings/* routes must be registered before the /:slug wildcard routes below —
// otherwise "bookings" would be matched as a bookingSlug by the generic :slug params.
router.get('/bookings/:cancelToken', publicController.getBookingByToken);
router.post(
  '/bookings/:cancelToken/reschedule',
  bookingLimiter,
  validate(rescheduleBookingSchema),
  publicController.rescheduleBooking
);
router.delete('/bookings/:cancelToken', publicController.cancelBookingByToken);

router.get('/:slug', publicController.getPublicProfile);
router.get('/:slug/:eventTypeSlug/dates', publicController.getAvailableDates);
router.get('/:slug/:eventTypeSlug', publicController.getEventTypeDetail);
router.get('/:slug/:eventTypeSlug/:date', publicController.getAvailableChips);
router.post('/:slug/:eventTypeSlug/book', bookingLimiter, validate(createBookingSchema), publicController.createBooking);

module.exports = router;
