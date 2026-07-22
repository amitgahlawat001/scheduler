require('dotenv').config();
const mongoose = require('mongoose');
const { nanoid } = require('nanoid');
const connectDB = require('../config/db');
const authService = require('../services/auth.service');
const User = require('../models/User.model');
const EventType = require('../models/EventType.model');
const AvailabilityRule = require('../models/AvailabilityRule.model');
const Booking = require('../models/Booking.model');

const USERS = [
  { name: 'Alice Carter', email: 'alice@example.com', bookingSlug: 'alice-carter' },
  { name: 'Ben Rodriguez', email: 'ben@example.com', bookingSlug: 'ben-rodriguez' },
  { name: 'Chloe Kim', email: 'chloe@example.com', bookingSlug: 'chloe-kim' },
  { name: 'David Okafor', email: 'david@example.com', bookingSlug: 'david-okafor' }
];
const PASSWORD = 'Password123!';

const EVENT_TYPE_TEMPLATES = [
  { name: 'Intro Call', durationMinutes: 15, description: 'A quick intro chat.', color: '#4A90D9', locationType: 'video_link', locationValue: 'https://meet.example.com/intro' },
  { name: 'Consultation', durationMinutes: 45, description: 'In-depth consultation session.', color: '#22c55e', locationType: 'video_link', locationValue: 'https://meet.example.com/consult' }
];

function dayString(offsetDays) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  return d.toISOString().slice(0, 10);
}

function slotAt(offsetDays, hourUTC) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() + offsetDays);
  d.setUTCHours(hourUTC, 0, 0, 0);
  return d;
}

async function seed() {
  await connectDB();

  await Promise.all([
    User.deleteMany({ email: { $in: USERS.map((u) => u.email) } }),
  ]);

  const passwordHash = await authService.hashPassword(PASSWORD);
  const createdUsers = [];

  for (const u of USERS) {
    const user = await User.create({
      name: u.name,
      email: u.email,
      passwordHash,
      bookingSlug: u.bookingSlug,
      publicDisplayName: u.name,
      bio: `Hi, I'm ${u.name.split(' ')[0]}. Book time with me below.`
    });
    createdUsers.push(user);

    await EventType.deleteMany({ userId: user._id });
    const eventTypes = [];
    for (const tpl of EVENT_TYPE_TEMPLATES) {
      eventTypes.push(
        await EventType.create({
          userId: user._id,
          slug: tpl.name.toLowerCase().replace(/\s+/g, '-'),
          ...tpl
        })
      );
    }

    await AvailabilityRule.deleteMany({ userId: user._id });
    for (let day = 1; day <= 5; day += 1) {
      await AvailabilityRule.create({
        userId: user._id,
        dayOfWeek: day,
        startTimeUTC: '09:00',
        endTimeUTC: '17:00'
      });
    }

    await Booking.deleteMany({ assignedUserId: user._id });
    const bookingSpecs = [
      { offsetDays: -5, hour: 10, name: 'Priya Shah', email: 'priya@example.com', noShow: false },
      { offsetDays: -2, hour: 14, name: 'Tom Becker', email: 'tom@example.com', noShow: true },
      { offsetDays: 1, hour: 9, name: 'Nina Volkov', email: 'nina@example.com', noShow: false },
      { offsetDays: 3, hour: 11, name: 'Marco Silva', email: 'marco@example.com', noShow: false },
      { offsetDays: 6, hour: 15, name: 'Grace Lin', email: 'grace@example.com', noShow: false }
    ];

    for (let i = 0; i < bookingSpecs.length; i += 1) {
      const spec = bookingSpecs[i];
      const eventType = eventTypes[i % eventTypes.length];
      const slotStartUTC = slotAt(spec.offsetDays, spec.hour);
      const slotEndUTC = new Date(slotStartUTC.getTime() + eventType.durationMinutes * 60 * 1000);
      await Booking.create({
        eventTypeId: eventType._id,
        assignedUserId: user._id,
        date: dayString(spec.offsetDays),
        slotStartUTC,
        slotEndUTC,
        visitorName: spec.name,
        visitorEmail: spec.email,
        location: { type: eventType.locationType, value: eventType.locationValue },
        cancelToken: nanoid(12),
        noShow: spec.noShow
      });
    }
  }

  console.log(`Seeded ${createdUsers.length} users:`);
  for (const u of createdUsers) {
    console.log(`  ${u.email} / ${PASSWORD}  (booking link: /${u.bookingSlug})`);
  }

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
