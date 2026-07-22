const { Schema, model } = require('mongoose');

const availabilityRuleSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  dayOfWeek: { type: Number, required: true, min: 0, max: 6 },
  startTimeUTC: { type: String, required: true },
  endTimeUTC: { type: String, required: true },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

availabilityRuleSchema.index({ userId: 1, dayOfWeek: 1 });

module.exports = model('AvailabilityRule', availabilityRuleSchema);
