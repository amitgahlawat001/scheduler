const { Schema, model } = require('mongoose');

const customAnswerSchema = new Schema({
  questionId: { type: String, required: true },
  label: { type: String, required: true },
  answer: { type: String, default: '' }
}, { _id: false });

const bookingSchema = new Schema({
  eventTypeId: { type: Schema.Types.ObjectId, ref: 'EventType', required: true, index: true },
  assignedUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  date: { type: String, required: true },
  slotStartUTC: { type: Date, required: true },
  slotEndUTC: { type: Date, required: true },
  visitorName: { type: String, required: true, trim: true },
  visitorEmail: { type: String, required: true, lowercase: true, trim: true },
  customAnswers: [customAnswerSchema],
  location: {
    type: { type: String, enum: ['phone', 'video_link', 'in_person', 'custom'], required: true },
    value: { type: String, default: '' }
  },
  cancelToken: { type: String, required: true, unique: true },
  reminderSentAt: { type: Date, default: null },
  noShow: { type: Boolean, default: false },
  rescheduledFrom: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
  rescheduledTo: { type: Schema.Types.ObjectId, ref: 'Booking', default: null },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

bookingSchema.index(
  { assignedUserId: 1, slotStartUTC: 1 },
  { unique: true, partialFilterExpression: { isDeleted: false } }
);
bookingSchema.index({ reminderSentAt: 1, slotStartUTC: 1 });
bookingSchema.index({ eventTypeId: 1, date: 1 });

module.exports = model('Booking', bookingSchema);
