const express = require('express');
const router = express.Router();
const DeviceStatus = require('../models/DeviceStatus'); // Import the model

// Route to fetch and process device status data from MongoDB
router.get('/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { startDate, endDate } = req.query; // Extract startDate and endDate from query

    try {
        // Convert startDate and endDate into timestamps (assuming seconds)
        const startTs = parseInt(startDate);
        const endTs = parseInt(endDate);

        // Validate timestamps
        if (isNaN(startTs) || isNaN(endTs)) {
            return res.status(400).json({ message: 'Invalid timestamp format. Please provide valid timestamps.' });
        }

        // Find the device status by its ID
        const deviceStatus = await DeviceStatus.findOne({ deviceId });
        if (!deviceStatus) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Filter the statuses between the provided date range
        const filteredStatuses = deviceStatus.statuses.filter(status => {
            return status.ts >= startTs && status.ts <= endTs;
        });

        // Process the statuses and calculate the durations
        const processedData = [];
        for (let i = 0; i < filteredStatuses.length - 1; i++) {
            const currentStatus = filteredStatuses[i];
            const nextStatus = filteredStatuses[i + 1];
            
            const duration = (nextStatus.ts - currentStatus.ts) / 60; // Convert seconds to minutes
            const statusValue = parseInt(currentStatus.value);

            processedData.push({
                date: new Date(currentStatus.ts * 1000).toISOString().split('T')[0], // Format the date
                startTime: new Date(currentStatus.ts * 1000).toISOString().substr(11, 5), // Get time as HH:mm
                endTime: new Date(nextStatus.ts * 1000).toISOString().substr(11, 5), // Get time as HH:mm
                status: statusValue,
                duration: duration > 0 ? duration : 0, // Ensure positive duration
            });
        }

        // Handle the last status (no next status to compare against)
        const lastStatus = filteredStatuses[filteredStatuses.length - 1];
        if (lastStatus) {
            const lastTime = new Date(lastStatus.ts * 1000);
            const statusValue = parseInt(lastStatus.value);

            processedData.push({
                date: lastTime.toISOString().split('T')[0],
                startTime: lastTime.toISOString().substr(11, 5),
                endTime: '23:59', // Assume the last status goes until the end of the day
                status: statusValue,
                duration: (23 * 60) + 59 - (lastTime.getHours() * 60 + lastTime.getMinutes()), // Minutes until end of day
            });
        }

        // Return the processed data
        res.json({ deviceId: deviceStatus.deviceId, history: processedData });
    } catch (error) {
        console.error(`Error fetching data for device ${deviceId}:`, error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
