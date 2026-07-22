const { Schema, model } = require('mongoose');

const availabilityOverrideSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  type: { type: String, enum: ['unavailable', 'extra_hours'], required: true },
  startTimeUTC: { type: Date },
  endTimeUTC: { type: Date },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

availabilityOverrideSchema.index({ userId: 1, date: 1 });

module.exports = model('AvailabilityOverride', availabilityOverrideSchema);
