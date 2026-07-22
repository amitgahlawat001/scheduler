const { z } = require('zod');

const customQuestionSchema = z.object({
  id: z.string().min(1),
  label: z.string().min(1),
  type: z.enum(['text', 'textarea', 'dropdown']),
  options: z.array(z.string()).optional(),
  required: z.boolean().optional()
});

const eventTypeBody = z.object({
  name: z.string().trim().min(1),
  durationMinutes: z.number().int().min(5),
  description: z.string().max(1000).optional(),
  color: z.string().optional(),
  locationType: z.enum(['phone', 'video_link', 'in_person', 'custom']),
  locationValue: z.string().max(500).optional(),
  bufferBeforeMinutes: z.number().int().min(0).optional(),
  bufferAfterMinutes: z.number().int().min(0).optional(),
  minNoticeMinutes: z.number().int().min(0).optional(),
  bookingWindowDays: z.number().int().min(1).optional(),
  maxBookingsPerDay: z.number().int().min(1).nullable().optional(),
  customQuestions: z.array(customQuestionSchema).optional(),
  roundRobinUserIds: z.array(z.string()).optional()
});

const createEventTypeSchema = z.object({ body: eventTypeBody });
const updateEventTypeSchema = z.object({ body: eventTypeBody.partial() });

module.exports = { createEventTypeSchema, updateEventTypeSchema };
