const nodemailer = require('nodemailer');
const env = require('../config/env');
const emailQueue = require('../jobs/emailQueue');

const transporter = nodemailer.createTransport({
  host: env.SMTP_HOST,
  port: env.SMTP_PORT,
  secure: env.SMTP_PORT === 465,
  auth: { user: env.SMTP_USER, pass: env.SMTP_PASS }
});

function send(to, subject, text) {
  return transporter.sendMail({ from: env.EMAIL_FROM, to, subject, text });
}

function sendBookingConfirmation(booking) {
  emailQueue.enqueue(() =>
    send(
      booking.visitorEmail,
      'Booking confirmed',
      `Your booking is confirmed for ${booking.slotStartUTC.toISOString()}.\nManage it: /bookings/${booking.cancelToken}`
    )
  );
}

function sendBookingCancellation(booking) {
  emailQueue.enqueue(() =>
    send(
      booking.visitorEmail,
      'Booking cancelled',
      `Your booking for ${booking.slotStartUTC.toISOString()} has been cancelled.`
    )
  );
}

function sendBookingReschedule(oldBooking, newBooking) {
  emailQueue.enqueue(() =>
    send(
      newBooking.visitorEmail,
      'Booking rescheduled',
      `Your booking was moved from ${oldBooking.slotStartUTC.toISOString()} to ${newBooking.slotStartUTC.toISOString()}.\nManage it: /bookings/${newBooking.cancelToken}`
    )
  );
}

function sendBookingReminder(booking) {
  emailQueue.enqueue(() =>
    send(
      booking.visitorEmail,
      'Reminder: upcoming booking',
      `Reminder: your booking is coming up at ${booking.slotStartUTC.toISOString()}.\nManage it: /bookings/${booking.cancelToken}`
    )
  );
}

module.exports = {
  sendBookingConfirmation,
  sendBookingCancellation,
  sendBookingReschedule,
  sendBookingReminder
};
