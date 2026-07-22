const reminderService = require('../services/reminder.service');
const asyncHandler = require('../utils/asyncHandler');
const env = require('../config/env');
const { cronIntervalMinutes } = require('../utils/cronInterval');

const sendReminders = asyncHandler(async (req, res) => {
  const remindersSent = await reminderService.sendDueReminders(cronIntervalMinutes(env.REMINDER_CRON_SCHEDULE));
  res.status(200).json({ success: true, data: { remindersSent } });
});

module.exports = { sendReminders };
