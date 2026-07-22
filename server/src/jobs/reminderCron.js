const cron = require('node-cron');
const env = require('../config/env');
const reminderService = require('../services/reminder.service');
const { cronIntervalMinutes } = require('../utils/cronInterval');

function startReminderCron() {
  const intervalMinutes = cronIntervalMinutes(env.REMINDER_CRON_SCHEDULE);
  cron.schedule(env.REMINDER_CRON_SCHEDULE, async () => {
    try {
      const sent = await reminderService.sendDueReminders(intervalMinutes);
      if (sent > 0) console.log(`Reminder cron: sent ${sent} reminder(s)`);
    } catch (err) {
      console.error('Reminder cron failed:', err.message);
    }
  });
}

module.exports = { startReminderCron };
