// routes/telemetry.js

const express = require('express');
const router = express.Router();
const Telemetry = require('../models/Telemetry');


router.get('/', async (req, res) => {
    try {
        const telemetryData = await Telemetry.find({});
        res.json(telemetryData);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


router.get('/:deviceId', async (req, res) => {
    try {
        const telemetry = await Telemetry.find({ deviceId: req.params.deviceId });
        res.json(telemetry);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
