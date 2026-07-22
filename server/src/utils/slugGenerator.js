const { customAlphabet } = require('nanoid');
const User = require('../models/User.model');
const EventType = require('../models/EventType.model');

const nanoid = customAlphabet('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz', 10);

function slugify(text) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '') || 'event';
}

async function generateUniqueBookingSlug() {
  for (let attempt = 0; attempt < 5; attempt++) {
    const candidate = nanoid();
    const exists = await User.exists({ bookingSlug: candidate });
    if (!exists) return candidate;
  }
  throw new Error('Failed to generate a unique booking slug after retries');
}

async function generateUniqueEventTypeSlug(userId, name) {
  const base = slugify(name);
  let candidate = base;
  let suffix = 1;
  while (await EventType.exists({ userId, slug: candidate, isDeleted: false })) {
    suffix += 1;
    candidate = `${base}-${suffix}`;
  }
  return candidate;
}

module.exports = { generateUniqueBookingSlug, generateUniqueEventTypeSlug, slugify };
