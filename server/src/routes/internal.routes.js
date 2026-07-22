const express = require('express');
const internalController = require('../controllers/internal.controller');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');

const router = express.Router();

function requireCronSecret(req, res, next) {
  if (req.headers['x-internal-secret'] !== env.CRON_SECRET) {
    return next(new ApiError(401, 'UNAUTHORIZED', 'Missing or incorrect X-Internal-Secret header.'));
  }
  next();
}

router.post('/send-reminders', requireCronSecret, internalController.sendReminders);

module.exports = router;
