const rateLimit = require('express-rate-limit');
const ApiError = require('../utils/ApiError');

function tooMany(code = 'TOO_MANY_REQUESTS') {
  return (req, res, next) => next(new ApiError(429, code, 'Too many requests, please slow down.'));
}

const publicLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 100,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany()
});

const bookingLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany('TOO_MANY_REQUESTS')
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: tooMany('TOO_MANY_ATTEMPTS')
});

module.exports = { publicLimiter, bookingLimiter, loginLimiter };
