const express = require('express');
const router = express.Router();
const { getTelemetryData } = require('../controller/DailyStatusController');

// Route để lấy dữ liệu từ MongoDB
router.get('/telemetry', getTelemetryData);

module.exports = router;
