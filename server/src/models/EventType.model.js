const { Schema, model } = require('mongoose');

const customQuestionSchema = new Schema({
  id: { type: String, required: true },
  label: { type: String, required: true },
  type: { type: String, enum: ['text', 'textarea', 'dropdown'], required: true },
  options: [{ type: String }],
  required: { type: Boolean, default: false }
}, { _id: false });

const eventTypeSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true },
  durationMinutes: { type: Number, required: true, min: 5 },
  description: { type: String, default: '' },
  color: { type: String, default: '#4A90D9' },
  locationType: { type: String, enum: ['phone', 'video_link', 'in_person', 'custom'], required: true },
  locationValue: { type: String, default: '' },
  bufferBeforeMinutes: { type: Number, default: 0 },
  bufferAfterMinutes: { type: Number, default: 0 },
  minNoticeMinutes: { type: Number, default: 0 },
  bookingWindowDays: { type: Number, default: 60 },
  maxBookingsPerDay: { type: Number, default: null },
  customQuestions: [customQuestionSchema],
  roundRobinUserIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

eventTypeSchema.index(
  { userId: 1, slug: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

module.exports = model('EventType', eventTypeSchema);
