const mongoose = require('mongoose');
const Booking = require('../models/Booking.model');

async function getBookingStats(userId, { from, to, eventTypeId } = {}) {
  const now = new Date();
  const rangeStart = from ? new Date(from) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const rangeEnd = to ? new Date(to) : now;

  const match = {
    assignedUserId: new mongoose.Types.ObjectId(userId),
    isDeleted: false,
    slotStartUTC: { $gte: rangeStart, $lte: rangeEnd }
  };
  if (eventTypeId) match.eventTypeId = new mongoose.Types.ObjectId(eventTypeId);

  const [byEventType, totals] = await Promise.all([
    Booking.aggregate([
      { $match: match },
      { $lookup: { from: 'eventtypes', localField: 'eventTypeId', foreignField: '_id', as: 'eventType' } },
      { $unwind: '$eventType' },
      { $group: { _id: '$eventTypeId', name: { $first: '$eventType.name' }, count: { $sum: 1 } } },
      { $project: { _id: 0, eventTypeId: '$_id', name: 1, count: 1 } }
    ]),
    Booking.aggregate([
      { $match: match },
      { $group: { _id: null, total: { $sum: 1 }, noShows: { $sum: { $cond: ['$noShow', 1, 0] } } } }
    ])
  ]);

  const total = totals[0]?.total || 0;
  const noShows = totals[0]?.noShows || 0;

  return {
    total,
    noShowRate: total > 0 ? noShows / total : 0,
    byEventType
  };
}

module.exports = { getBookingStats };
