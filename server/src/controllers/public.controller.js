const User = require('../models/User.model');
const Booking = require('../models/Booking.model');
const EventType = require('../models/EventType.model');
const eventTypeService = require('../services/eventType.service');
const bookingService = require('../services/booking.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');

async function resolveHost(slug) {
  const user = await User.findOne({ bookingSlug: slug, isDeleted: false });
  if (!user) throw new ApiError(404, 'LINK_NOT_FOUND', "This booking link doesn't exist or is no longer active.");
  return user;
}

async function resolveEventType(user, eventTypeSlug) {
  const eventType = await eventTypeService.findBySlugForUser(user._id, eventTypeSlug);
  if (!eventType) throw new ApiError(404, 'LINK_NOT_FOUND', "This booking link doesn't exist or is no longer active.");
  return eventType;
}

const getPublicProfile = asyncHandler(async (req, res) => {
  const user = await resolveHost(req.params.slug);
  const eventTypes = await eventTypeService.getPublicEventTypes(user._id);

  res.status(200).json({
    success: true,
    data: {
      hostDisplayName: user.publicDisplayName || user.name,
      bio: user.bio,
      photoUrl: user.photoUrl,
      eventTypes: eventTypes.map((et) => ({
        id: et._id,
        slug: et.slug,
        name: et.name,
        durationMinutes: et.durationMinutes,
        description: et.description
      }))
    }
  });
});

const getEventTypeDetail = asyncHandler(async (req, res) => {
  const user = await resolveHost(req.params.slug);
  const eventType = await resolveEventType(user, req.params.eventTypeSlug);

  res.status(200).json({
    success: true,
    data: {
      name: eventType.name,
      durationMinutes: eventType.durationMinutes,
      description: eventType.description,
      locationType: eventType.locationType,
      customQuestions: eventType.customQuestions
    }
  });
});

const getAvailableDates = asyncHandler(async (req, res) => {
  const user = await resolveHost(req.params.slug);
  const eventType = await resolveEventType(user, req.params.eventTypeSlug);
  const dates = await bookingService.getAvailableDates(eventType);
  res.status(200).json({ success: true, data: { dates } });
});

const getAvailableChips = asyncHandler(async (req, res) => {
  const user = await resolveHost(req.params.slug);
  const eventType = await resolveEventType(user, req.params.eventTypeSlug);
  const chips = await bookingService.getAvailableChips(eventType, req.params.date);
  res.status(200).json({
    success: true,
    data: { date: req.params.date, slots: chips.map((c) => c.slotStartUTC.toISOString()) }
  });
});

const createBooking = asyncHandler(async (req, res) => {
  const user = await resolveHost(req.params.slug);
  const eventType = await resolveEventType(user, req.params.eventTypeSlug);
  const { slotStartUTC, visitorName, visitorEmail, customAnswers } = req.body;

  const booking = await bookingService.createBooking(
    eventType,
    new Date(slotStartUTC),
    visitorName,
    visitorEmail,
    customAnswers
  );

  res.status(201).json({
    success: true,
    data: {
      id: booking._id,
      slotStartUTC: booking.slotStartUTC.toISOString(),
      slotEndUTC: booking.slotEndUTC.toISOString(),
      location: booking.location,
      cancelToken: booking.cancelToken
    }
  });
});

const getBookingByToken = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ cancelToken: req.params.cancelToken });
  if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');

  const eventType = await EventType.findById(booking.eventTypeId);
  const host = await User.findById(eventType.userId);

  res.status(200).json({
    success: true,
    data: {
      eventTypeName: eventType.name,
      hostSlug: host.bookingSlug,
      eventTypeSlug: eventType.slug,
      slotStartUTC: booking.slotStartUTC.toISOString(),
      location: booking.location,
      visitorName: booking.visitorName,
      isCancelled: booking.isDeleted
    }
  });
});

const rescheduleBooking = asyncHandler(async (req, res) => {
  const existing = await Booking.findOne({ cancelToken: req.params.cancelToken });
  if (!existing) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');

  const eventType = await EventType.findById(existing.eventTypeId);
  if (!eventType || eventType.isDeleted) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');

  const booking = await bookingService.rescheduleBooking(
    eventType,
    req.params.cancelToken,
    new Date(req.body.slotStartUTC)
  );

  res.status(200).json({
    success: true,
    data: {
      id: booking._id,
      slotStartUTC: booking.slotStartUTC.toISOString(),
      slotEndUTC: booking.slotEndUTC.toISOString(),
      location: booking.location,
      cancelToken: booking.cancelToken,
      rescheduledFrom: booking.rescheduledFrom
    }
  });
});

const cancelBookingByToken = asyncHandler(async (req, res) => {
  await bookingService.cancelBookingByToken(req.params.cancelToken);
  res.status(200).json({ success: true, data: { message: 'Booking cancelled.' } });
});

module.exports = {
  getPublicProfile,
  getEventTypeDetail,
  getAvailableDates,
  getAvailableChips,
  createBooking,
  getBookingByToken,
  rescheduleBooking,
  cancelBookingByToken
};
