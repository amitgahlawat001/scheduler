const { z } = require('zod');

const signupSchema = z.object({
  body: z.object({
    name: z.string().trim().min(1),
    email: z.string().trim().email(),
    password: z.string().min(8)
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email(),
    password: z.string().min(1)
  })
});

const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().max(1000).optional(),
    photoUrl: z.string().url().optional().or(z.literal('')),
    publicDisplayName: z.string().max(120).optional()
  })
});

module.exports = { signupSchema, loginSchema, updateProfileSchema };
