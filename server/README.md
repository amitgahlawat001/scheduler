# Scheduler API

## Setup

```
npm install
cp .env.example .env   # fill in MongoDB URI, JWT secrets, SMTP creds
npm run dev             # nodemon, port 4000 by default
```

Requires a running MongoDB instance (`MONGO_URI`).

## Tests

```
npm test
```

Unit tests cover the pure slot/buffer math in `src/utils/timeSlots.js`. Integration tests (`tests/integration/`) are scaffolded but not yet written — they'll need `mongodb-memory-server` (already a devDependency) to spin up an in-memory Mongo instance per suite.

## Reminder cron

Runs in-process via `node-cron` (`src/jobs/reminderCron.js`) on `REMINDER_CRON_SCHEDULE`. Requires an always-on process — if deploying serverless, use `POST /api/internal/send-reminders` (header `X-Internal-Secret: <CRON_SECRET>`) with an external scheduler like cron-job.org instead.
