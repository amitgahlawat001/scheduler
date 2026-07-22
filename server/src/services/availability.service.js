const AvailabilityRule = require('../models/AvailabilityRule.model');
const AvailabilityOverride = require('../models/AvailabilityOverride.model');
const ApiError = require('../utils/ApiError');

function timeToMinutes(hhmm) {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

async function createRule(userId, dayOfWeek, startTimeUTC, endTimeUTC) {
  if (timeToMinutes(endTimeUTC) <= timeToMinutes(startTimeUTC)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'endTimeUTC must be after startTimeUTC');
  }

  const existing = await AvailabilityRule.find({ userId, dayOfWeek, isDeleted: false });
  const newStart = timeToMinutes(startTimeUTC);
  const newEnd = timeToMinutes(endTimeUTC);
  const overlaps = existing.some((rule) => {
    const s = timeToMinutes(rule.startTimeUTC);
    const e = timeToMinutes(rule.endTimeUTC);
    return newStart < e && s < newEnd;
  });
  if (overlaps) {
    throw new ApiError(409, 'OVERLAPPING_RULE', 'This time overlaps with an existing rule for this day.');
  }

  return AvailabilityRule.create({ userId, dayOfWeek, startTimeUTC, endTimeUTC });
}

async function listRules(userId) {
  return AvailabilityRule.find({ userId, isDeleted: false }).sort({ dayOfWeek: 1, startTimeUTC: 1 });
}

async function deleteRule(userId, ruleId) {
  const rule = await AvailabilityRule.findById(ruleId);
  if (!rule || rule.isDeleted) throw new ApiError(404, 'NOT_FOUND', 'Rule not found');
  if (String(rule.userId) !== String(userId)) throw new ApiError(403, 'FORBIDDEN', 'Not your rule');
  rule.isDeleted = true;
  await rule.save();
}

async function createOverride(userId, date, type, startTimeUTC, endTimeUTC) {
  if (type === 'extra_hours' && (!startTimeUTC || !endTimeUTC)) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'extra_hours overrides require startTimeUTC and endTimeUTC');
  }
  const existing = await AvailabilityOverride.findOne({ userId, date, isDeleted: false });
  if (existing) {
    throw new ApiError(409, 'OVERRIDE_EXISTS', 'An override for this date already exists.');
  }
  return AvailabilityOverride.create({ userId, date, type, startTimeUTC, endTimeUTC });
}

async function listOverrides(userId) {
  return AvailabilityOverride.find({ userId, isDeleted: false }).sort({ date: 1 });
}

async function deleteOverride(userId, overrideId) {
  const override = await AvailabilityOverride.findById(overrideId);
  if (!override || override.isDeleted) throw new ApiError(404, 'NOT_FOUND', 'Override not found');
  if (String(override.userId) !== String(userId)) throw new ApiError(403, 'FORBIDDEN', 'Not your override');
  override.isDeleted = true;
  await override.save();
}

/**
 * Resolves the effective open windows for a given host + date, in UTC Date objects.
 * A host can have multiple non-overlapping rules on the same day of week (e.g. 9-12 and 14-17),
 * so this returns an array, not a single window. An 'unavailable' override empties it;
 * an 'extra_hours' override replaces the recurring rules for that date rather than adding to them.
 */
async function getEffectiveWindows(userId, date) {
  const override = await AvailabilityOverride.findOne({ userId, date, isDeleted: false });
  if (override && override.type === 'unavailable') return [];
  if (override && override.type === 'extra_hours') {
    return [{ startTimeUTC: override.startTimeUTC, endTimeUTC: override.endTimeUTC }];
  }

  const dayOfWeek = new Date(`${date}T00:00:00.000Z`).getUTCDay();
  const rules = await AvailabilityRule.find({ userId, dayOfWeek, isDeleted: false });
  return rules.map((rule) => ({
    startTimeUTC: new Date(`${date}T${rule.startTimeUTC}:00.000Z`),
    endTimeUTC: new Date(`${date}T${rule.endTimeUTC}:00.000Z`)
  }));
}

module.exports = {
  createRule,
  listRules,
  deleteRule,
  createOverride,
  listOverrides,
  deleteOverride,
  getEffectiveWindows
};
