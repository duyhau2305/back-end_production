// routes/telemetry.js

const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');

// Lấy tất cả telemetry của nhiều thiết bị
router.get('/', async (req, res) => {
    try {
        const telemetryData = await Telemetry.find({});
        res.json(telemetryData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Lấy dữ liệu status của từng thiết bị theo deviceId
router.get('/:deviceId', async (req, res) => {
    try {
        const telemetry = await Telemetry.find({ deviceId: req.params.deviceId });
        res.json(telemetry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
