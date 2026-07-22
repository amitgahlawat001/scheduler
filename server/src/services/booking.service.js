const { nanoid } = require('nanoid');
const Booking = require('../models/Booking.model');
const ApiError = require('../utils/ApiError');
const availabilityService = require('./availability.service');
const emailService = require('./email.service');
const { expandToBuckets, applyBuffer } = require('../utils/timeSlots');
const { ROUND_ROBIN_WINDOW_DAYS } = require('../config/constants');

const DAY_MS = 24 * 60 * 60 * 1000;

function todayUTCDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isDateWithinWindow(date, bookingWindowDays) {
  const today = new Date(`${todayUTCDateString()}T00:00:00.000Z`);
  const target = new Date(`${date}T00:00:00.000Z`);
  const diffDays = (target - today) / DAY_MS;
  return diffDays >= 0 && diffDays <= bookingWindowDays;
}

function candidateHostIds(eventType) {
  return eventType.roundRobinUserIds && eventType.roundRobinUserIds.length > 0
    ? eventType.roundRobinUserIds.map(String)
    : [String(eventType.userId)];
}

/**
 * Returns bookable slot starts for a date, each tagged with which candidate host(s) are free at it.
 * Round-robin event types check each candidate's own rules/bookings independently and merge —
 * see the round-robin note in the architecture doc for why this isn't a true collective calendar.
 */
async function getAvailableChips(eventType, date) {
  if (!isDateWithinWindow(date, eventType.bookingWindowDays)) return [];

  if (eventType.maxBookingsPerDay != null) {
    const countForDay = await Booking.countDocuments({ eventTypeId: eventType._id, date, isDeleted: false });
    if (countForDay >= eventType.maxBookingsPerDay) return [];
  }

  const now = new Date();
  const minNoticeCutoff = new Date(now.getTime() + eventType.minNoticeMinutes * 60000);
  const candidates = candidateHostIds(eventType);
  const bucketMap = new Map();

  for (const candidateId of candidates) {
    const windows = await availabilityService.getEffectiveWindows(candidateId, date);
    if (windows.length === 0) continue;

    const existingBookings = await Booking.find({
      assignedUserId: candidateId,
      isDeleted: false,
      date
    });
    const occupied = existingBookings.map((b) =>
      applyBuffer(b.slotStartUTC, b.slotEndUTC, eventType.bufferBeforeMinutes, eventType.bufferAfterMinutes)
    );

    for (const window of windows) {
      const buckets = expandToBuckets(window.startTimeUTC, window.endTimeUTC, eventType.durationMinutes);
      for (const bucketStart of buckets) {
        if (bucketStart < minNoticeCutoff) continue;
        const bucketEnd = new Date(bucketStart.getTime() + eventType.durationMinutes * 60000);
        const collides = occupied.some((o) => bucketStart < o.end && o.start < bucketEnd);
        if (collides) continue;

        const key = bucketStart.toISOString();
        if (!bucketMap.has(key)) bucketMap.set(key, new Set());
        bucketMap.get(key).add(candidateId);
      }
    }
  }

  return Array.from(bucketMap.entries())
    .map(([iso, hostSet]) => ({ slotStartUTC: new Date(iso), candidateUserIds: Array.from(hostSet) }))
    .sort((a, b) => a.slotStartUTC - b.slotStartUTC);
}

// Walks the booking window day by day. Fine at this scale; would need a batched
// aggregation instead of N sequential getAvailableChips calls if bookingWindowDays grows large.
async function getAvailableDates(eventType) {
  const dates = [];
  const today = new Date(`${todayUTCDateString()}T00:00:00.000Z`);
  for (let i = 0; i <= eventType.bookingWindowDays; i++) {
    const date = new Date(today.getTime() + i * DAY_MS).toISOString().slice(0, 10);
    const chips = await getAvailableChips(eventType, date);
    if (chips.length > 0) dates.push(date);
  }
  return dates;
}

async function pickAssignedUser(eventType, candidateUserIds) {
  if (candidateUserIds.length === 1) return candidateUserIds[0];

  const since = new Date(Date.now() - ROUND_ROBIN_WINDOW_DAYS * DAY_MS);
  const counts = await Promise.all(
    candidateUserIds.map(async (id) => ({
      id,
      count: await Booking.countDocuments({
        eventTypeId: eventType._id,
        assignedUserId: id,
        isDeleted: false,
        createdAt: { $gte: since }
      })
    }))
  );
  counts.sort((a, b) => a.count - b.count);
  return counts[0].id;
}

function validateAndSnapshotAnswers(eventType, customAnswers) {
  const answers = customAnswers || [];
  const byId = new Map(answers.map((a) => [a.questionId, a]));

  for (const q of eventType.customQuestions) {
    const a = byId.get(q.id);
    if (q.required && (!a || !a.answer || !String(a.answer).trim())) {
      throw new ApiError(400, 'VALIDATION_ERROR', `Missing required answer for "${q.label}"`);
    }
  }

  return eventType.customQuestions.map((q) => ({
    questionId: q.id,
    label: q.label,
    answer: (byId.get(q.id) || {}).answer || ''
  }));
}

async function createBooking(eventType, slotStartUTC, visitorName, visitorEmail, customAnswers, { silent = false } = {}) {
  const date = slotStartUTC.toISOString().slice(0, 10);
  const chips = await getAvailableChips(eventType, date);
  const chip = chips.find((c) => c.slotStartUTC.getTime() === slotStartUTC.getTime());

  if (!chip) {
    const now = new Date();
    if (slotStartUTC < now) throw new ApiError(422, 'SLOT_IN_PAST', 'Requested slot is in the past.');
    const minNoticeCutoff = new Date(now.getTime() + eventType.minNoticeMinutes * 60000);
    if (slotStartUTC < minNoticeCutoff) throw new ApiError(422, 'SLOT_TOO_SOON', 'This slot is too soon to book.');
    throw new ApiError(422, 'SLOT_OUTSIDE_AVAILABILITY', 'This slot is not available.');
  }

  const answers = validateAndSnapshotAnswers(eventType, customAnswers);
  const assignedUserId = await pickAssignedUser(eventType, chip.candidateUserIds);
  const slotEndUTC = new Date(slotStartUTC.getTime() + eventType.durationMinutes * 60000);

  try {
    const booking = await Booking.create({
      eventTypeId: eventType._id,
      assignedUserId,
      date,
      slotStartUTC,
      slotEndUTC,
      visitorName,
      visitorEmail,
      customAnswers: answers,
      location: { type: eventType.locationType, value: eventType.locationValue },
      cancelToken: nanoid(12)
    });
    if (!silent) emailService.sendBookingConfirmation(booking);
    return booking;
  } catch (err) {
    if (err.code === 11000) {
      throw new ApiError(409, 'SLOT_UNAVAILABLE', 'That slot was just booked by someone else.');
    }
    throw err;
  }
}

async function rescheduleBooking(eventType, cancelToken, newSlotStartUTC) {
  const oldBooking = await Booking.findOne({ cancelToken });
  if (!oldBooking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  if (oldBooking.isDeleted) throw new ApiError(410, 'ALREADY_CANCELLED', 'This booking was already cancelled.');

  const newBooking = await createBooking(
    eventType,
    newSlotStartUTC,
    oldBooking.visitorName,
    oldBooking.visitorEmail,
    oldBooking.customAnswers.map((a) => ({ questionId: a.questionId, answer: a.answer })),
    { silent: true }
  );

  newBooking.rescheduledFrom = oldBooking._id;
  await newBooking.save();
  oldBooking.rescheduledTo = newBooking._id;
  oldBooking.isDeleted = true;
  await oldBooking.save();

  emailService.sendBookingReschedule(oldBooking, newBooking);
  return newBooking;
}

async function cancelBookingAsHost(bookingId, hostUserId) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  if (String(booking.assignedUserId) !== String(hostUserId)) throw new ApiError(403, 'FORBIDDEN', 'Not your booking.');
  if (booking.isDeleted) throw new ApiError(410, 'ALREADY_CANCELLED', 'Booking already cancelled.');
  booking.isDeleted = true;
  await booking.save();
  emailService.sendBookingCancellation(booking);
}

async function cancelBookingByToken(cancelToken) {
  const booking = await Booking.findOne({ cancelToken });
  if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  if (booking.isDeleted) throw new ApiError(410, 'ALREADY_CANCELLED', 'Booking already cancelled.');
  booking.isDeleted = true;
  await booking.save();
  emailService.sendBookingCancellation(booking);
}

async function markNoShow(bookingId, hostUserId, noShow) {
  const booking = await Booking.findById(bookingId);
  if (!booking) throw new ApiError(404, 'BOOKING_NOT_FOUND', 'Booking not found.');
  if (String(booking.assignedUserId) !== String(hostUserId)) throw new ApiError(403, 'FORBIDDEN', 'Not your booking.');
  if (booking.slotEndUTC > new Date()) throw new ApiError(422, 'BOOKING_NOT_PAST', "Can't mark a future booking as no-show.");
  booking.noShow = noShow;
  await booking.save();
  return booking;
}

async function listBookingsForHost(hostUserId, { page = 1, limit = 20, upcoming, eventTypeId } = {}) {
  const query = { assignedUserId: hostUserId, isDeleted: false };
  if (eventTypeId) query.eventTypeId = eventTypeId;
  if (upcoming === true) query.slotStartUTC = { $gte: new Date() };
  else if (upcoming === false) query.slotStartUTC = { $lt: new Date() };

  const total = await Booking.countDocuments(query);
  const bookings = await Booking.find(query)
    .sort({ slotStartUTC: upcoming === false ? -1 : 1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('eventTypeId', 'name');

  return { bookings, pagination: { page, limit, total } };
}

module.exports = {
  getAvailableChips,
  getAvailableDates,
  createBooking,
  rescheduleBooking,
  cancelBookingAsHost,
  cancelBookingByToken,
  markNoShow,
  listBookingsForHost
};
