const EventType = require('../models/EventType.model');
const ApiError = require('../utils/ApiError');
const { generateUniqueEventTypeSlug } = require('../utils/slugGenerator');

async function createEventType(userId, payload) {
  const questionIds = (payload.customQuestions || []).map((q) => q.id);
  if (new Set(questionIds).size !== questionIds.length) {
    throw new ApiError(400, 'VALIDATION_ERROR', 'customQuestions ids must be unique');
  }

  const slug = await generateUniqueEventTypeSlug(userId, payload.name);
  return EventType.create({ ...payload, userId, slug });
}

async function updateEventType(userId, eventTypeId, payload) {
  const eventType = await EventType.findById(eventTypeId);
  if (!eventType || eventType.isDeleted) throw new ApiError(404, 'NOT_FOUND', 'Event type not found');
  if (String(eventType.userId) !== String(userId)) throw new ApiError(403, 'FORBIDDEN', 'Not your event type');

  if (payload.customQuestions) {
    const questionIds = payload.customQuestions.map((q) => q.id);
    if (new Set(questionIds).size !== questionIds.length) {
      throw new ApiError(400, 'VALIDATION_ERROR', 'customQuestions ids must be unique');
    }
  }

  Object.assign(eventType, payload);
  await eventType.save();
  return eventType;
}

async function listEventTypes(userId) {
  return EventType.find({ userId, isDeleted: false }).sort({ createdAt: -1 });
}

async function deleteEventType(userId, eventTypeId) {
  const eventType = await EventType.findById(eventTypeId);
  if (!eventType || eventType.isDeleted) throw new ApiError(404, 'NOT_FOUND', 'Event type not found');
  if (String(eventType.userId) !== String(userId)) throw new ApiError(403, 'FORBIDDEN', 'Not your event type');
  eventType.isDeleted = true;
  await eventType.save();
}

async function getPublicEventTypes(userId) {
  return EventType.find({ userId, isDeleted: false }).sort({ createdAt: 1 });
}

async function findBySlugForUser(userId, slug) {
  return EventType.findOne({ userId, slug, isDeleted: false });
}

module.exports = {
  createEventType,
  updateEventType,
  listEventTypes,
  deleteEventType,
  getPublicEventTypes,
  findBySlugForUser
};
