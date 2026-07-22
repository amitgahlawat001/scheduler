const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  bookingSlug: { type: String, unique: true, sparse: true },
  bio: { type: String, default: '' },
  photoUrl: { type: String, default: '' },
  publicDisplayName: { type: String, default: '' },
  isDeleted: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = model('User', userSchema);
