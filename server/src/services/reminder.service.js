const Booking = require('../models/Booking.model');
const emailService = require('./email.service');
const { REMINDER_LEAD_MINUTES } = require('../config/constants');

async function sendDueReminders(windowMinutes) {
  const now = new Date();
  const windowStart = new Date(now.getTime() + REMINDER_LEAD_MINUTES * 60000);
  const windowEnd = new Date(windowStart.getTime() + windowMinutes * 60000);

  const due = await Booking.find({
    isDeleted: false,
    reminderSentAt: null,
    slotStartUTC: { $gte: windowStart, $lt: windowEnd }
  });

  let sent = 0;
  for (const booking of due) {
    const claimed = await Booking.findOneAndUpdate(
      { _id: booking._id, reminderSentAt: null },
      { reminderSentAt: new Date() }
    );
    if (!claimed) continue; // another trigger already claimed it
    emailService.sendBookingReminder(booking);
    sent += 1;
  }
  return sent;
}

module.exports = { sendDueReminders };
