const express = require('express');
const eventTypeController = require('../controllers/eventType.controller');
const authMiddleware = require('../middleware/auth.middleware');
const validate = require('../middleware/validate.middleware');
const { createEventTypeSchema, updateEventTypeSchema } = require('../validators/eventType.validators');

const router = express.Router();
router.use(authMiddleware);

router.post('/', validate(createEventTypeSchema), eventTypeController.createEventType);
router.get('/', eventTypeController.listEventTypes);
router.patch('/:id', validate(updateEventTypeSchema), eventTypeController.updateEventType);
router.delete('/:id', eventTypeController.deleteEventType);

module.exports = router;
