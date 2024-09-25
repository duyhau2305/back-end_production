const express = require('express');
const DeviceStatus = require('../models/DeviceStatus');

const router = express.Router();

// API để lấy status theo deviceId
router.get('/:deviceId/status', async (req, res) => {
    const { deviceId } = req.params;
    
    try {
        const deviceStatus = await DeviceStatus.findOne({ deviceId });
        if (!deviceStatus) {
            return res.status(404).json({ message: 'Device not found' });
        }
        res.json(deviceStatus.statuses);
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
