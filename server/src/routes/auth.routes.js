const express = require('express');
const authController = require('../controllers/auth.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { loginLimiter } = require('../middleware/rateLimit.middleware');
const { signupSchema, loginSchema, updateProfileSchema } = require('../validators/auth.validators');

const router = express.Router();

router.post('/signup', validate(signupSchema), authController.signup);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authController.logout);
router.get('/me', authMiddleware, authController.me);
router.patch('/profile', authMiddleware, validate(updateProfileSchema), authController.updateProfile);

module.exports = router;
