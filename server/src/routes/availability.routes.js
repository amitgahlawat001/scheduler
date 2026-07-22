const express = require('express');
const availabilityController = require('../controllers/availability.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createRuleSchema, createOverrideSchema } = require('../validators/availability.validators');

const router = express.Router();
router.use(authMiddleware);

router.post('/rules', validate(createRuleSchema), availabilityController.createRule);
router.get('/rules', availabilityController.listRules);
router.delete('/rules/:id', availabilityController.deleteRule);

router.post('/overrides', validate(createOverrideSchema), availabilityController.createOverride);
router.get('/overrides', availabilityController.listOverrides);
router.delete('/overrides/:id', availabilityController.deleteOverride);

router.post('/generate-link', availabilityController.generateLink);

module.exports = router;
