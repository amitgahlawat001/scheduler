const env = require('./config/env');
const connectDB = require('./config/db');
const app = require('./app');
const { startReminderCron } = require('./jobs/reminderCron');

async function main() {
  await connectDB();
  startReminderCron();

  app.listen(env.PORT, () => {
    console.log(`Server listening on port ${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Fatal startup error:', err);
  process.exit(1);
});
