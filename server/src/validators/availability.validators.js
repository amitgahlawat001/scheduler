const { z } = require('zod');

const timeString = z.string().regex(/^\d{2}:\d{2}$/, 'Expected HH:mm');
const dateString = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Expected YYYY-MM-DD');

const createRuleSchema = z.object({
  body: z.object({
    dayOfWeek: z.number().int().min(0).max(6),
    startTimeUTC: timeString,
    endTimeUTC: timeString
  })
});

const createOverrideSchema = z.object({
  body: z.object({
    date: dateString,
    type: z.enum(['unavailable', 'extra_hours']),
    startTimeUTC: z.string().datetime().optional(),
    endTimeUTC: z.string().datetime().optional()
  })
});

module.exports = { createRuleSchema, createOverrideSchema };
