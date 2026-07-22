const analyticsService = require('../services/analytics.service');
const asyncHandler = require('../utils/asyncHandler');

const getStats = asyncHandler(async (req, res) => {
  const { from, to, eventTypeId } = req.query;
  const stats = await analyticsService.getBookingStats(req.user.id, { from, to, eventTypeId });
  res.status(200).json({ success: true, data: stats });
});

module.exports = { getStats };
