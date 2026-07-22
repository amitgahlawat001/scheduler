const { z } = require('zod');

const answerSchema = z.object({
  questionId: z.string().min(1),
  answer: z.string().max(2000).optional()
});

const createBookingSchema = z.object({
  body: z.object({
    slotStartUTC: z.string().datetime(),
    visitorName: z.string().trim().min(1),
    visitorEmail: z.string().trim().email(),
    customAnswers: z.array(answerSchema).optional()
  })
});

const rescheduleBookingSchema = z.object({
  body: z.object({
    slotStartUTC: z.string().datetime()
  })
});

const noShowSchema = z.object({
  body: z.object({
    noShow: z.boolean()
  })
});

module.exports = { createBookingSchema, rescheduleBookingSchema, noShowSchema };
