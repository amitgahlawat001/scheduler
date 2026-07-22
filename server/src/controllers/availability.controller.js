const User = require('../models/User.model');
const availabilityService = require('../services/availability.service');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const env = require('../config/env');
const { generateUniqueBookingSlug } = require('../utils/slugGenerator');

const createRule = asyncHandler(async (req, res) => {
  const { dayOfWeek, startTimeUTC, endTimeUTC } = req.body;
  const rule = await availabilityService.createRule(req.user.id, dayOfWeek, startTimeUTC, endTimeUTC);
  res.status(201).json({ success: true, data: rule });
});

const listRules = asyncHandler(async (req, res) => {
  const rules = await availabilityService.listRules(req.user.id);
  res.status(200).json({ success: true, data: { rules } });
});

const deleteRule = asyncHandler(async (req, res) => {
  await availabilityService.deleteRule(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { message: 'Rule removed.' } });
});

const createOverride = asyncHandler(async (req, res) => {
  const { date, type, startTimeUTC, endTimeUTC } = req.body;
  const override = await availabilityService.createOverride(req.user.id, date, type, startTimeUTC, endTimeUTC);
  res.status(201).json({ success: true, data: override });
});

const listOverrides = asyncHandler(async (req, res) => {
  const overrides = await availabilityService.listOverrides(req.user.id);
  res.status(200).json({ success: true, data: { overrides } });
});

const deleteOverride = asyncHandler(async (req, res) => {
  await availabilityService.deleteOverride(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { message: 'Override removed.' } });
});

const generateLink = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  if (!user) throw new ApiError(401, 'UNAUTHORIZED', 'User not found.');

  if (!user.bookingSlug) {
    user.bookingSlug = await generateUniqueBookingSlug();
    await user.save();
  }

  res.status(200).json({
    success: true,
    data: { bookingSlug: user.bookingSlug, bookingUrl: `${env.FRONTEND_ORIGIN}/${user.bookingSlug}` }
  });
});

module.exports = {
  createRule,
  listRules,
  deleteRule,
  createOverride,
  listOverrides,
  deleteOverride,
  generateLink
};
