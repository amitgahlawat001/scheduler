const eventTypeService = require('../services/eventType.service');
const asyncHandler = require('../utils/asyncHandler');

const createEventType = asyncHandler(async (req, res) => {
  const eventType = await eventTypeService.createEventType(req.user.id, req.body);
  res.status(201).json({ success: true, data: eventType });
});

const listEventTypes = asyncHandler(async (req, res) => {
  const eventTypes = await eventTypeService.listEventTypes(req.user.id);
  res.status(200).json({ success: true, data: { eventTypes } });
});

const updateEventType = asyncHandler(async (req, res) => {
  const eventType = await eventTypeService.updateEventType(req.user.id, req.params.id, req.body);
  res.status(200).json({ success: true, data: eventType });
});

const deleteEventType = asyncHandler(async (req, res) => {
  await eventTypeService.deleteEventType(req.user.id, req.params.id);
  res.status(200).json({ success: true, data: { message: 'Event type removed.' } });
});

module.exports = { createEventType, listEventTypes, updateEventType, deleteEventType };
