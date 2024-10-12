const express = require('express');
const dailyStatusController = require('../controller/DailyStatusController');

const router = express.Router();

// Get Data fomatted from ThingBoard
router.get('/telemetry', dailyStatusController.getTelemetry);

module.exports = router;
