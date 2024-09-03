// routes/supportRequestRoutes.js
const express = require('express');
const router = express.Router();
const supportRequestController = require('../controller/supportRequestController');

router.get('/', supportRequestController.getAllRequests);
router.get('/:id', supportRequestController.getRequestById);
router.post('/', supportRequestController.createRequest);
router.put('/:id', supportRequestController.updateRequest);
router.delete('/:id', supportRequestController.deleteRequest);
router.post('/send-email', supportRequestController. sendSupportEmail);

module.exports = router;
