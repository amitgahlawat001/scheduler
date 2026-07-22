const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');

const listBookings = asyncHandler(async (req, res) => {
  const { page, limit, upcoming, eventTypeId } = req.query;
  const parsedUpcoming = upcoming === undefined ? undefined : upcoming === 'true';

  const { bookings, pagination } = await bookingService.listBookingsForHost(req.user.id, {
    page: page ? Number(page) : undefined,
    limit: limit ? Number(limit) : undefined,
    upcoming: parsedUpcoming,
    eventTypeId
  });

  res.status(200).json({
    success: true,
    data: {
      bookings: bookings.map((b) => ({
        id: b._id,
        eventTypeName: b.eventTypeId?.name,
        date: b.date,
        slotStartUTC: b.slotStartUTC.toISOString(),
        visitorName: b.visitorName,
        visitorEmail: b.visitorEmail,
        noShow: b.noShow
      })),
      pagination
    }
  });
});

const cancelBooking = asyncHandler(async (req, res) => {
  await bookingService.cancelBookingAsHost(req.params.id, req.user.id);
  res.status(200).json({ success: true, data: { message: 'Booking cancelled.' } });
});

const setNoShow = asyncHandler(async (req, res) => {
  const booking = await bookingService.markNoShow(req.params.id, req.user.id, req.body.noShow);
  res.status(200).json({ success: true, data: booking });
});

module.exports = { listBookings, cancelBooking, setNoShow };
