const express = require('express');
const router = express.Router();
const DeviceStatus = require('../models/DeviceStatus'); // Import model

// Route để lấy dữ liệu từ MongoDB và lọc theo khoảng thời gian
router.get('/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { startDate, endDate } = req.query; // Lấy startDate và endDate từ query string

    try {
        // Chuyển đổi startDate và endDate thành dạng số (timestamp)
        const startTs = parseInt(startDate);  // Timestamp tính theo seconds
        const endTs = parseInt(endDate);      // Timestamp tính theo seconds

        // Kiểm tra nếu startDate hoặc endDate không hợp lệ
        if (isNaN(startTs) || isNaN(endTs)) {
            return res.status(400).json({ message: 'Invalid timestamp format. Please provide valid timestamps.' });
        }

        // Tìm trạng thái của thiết bị theo deviceId
        const deviceStatus = await DeviceStatus.findOne({ deviceId });

        if (!deviceStatus) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Lọc các status có timestamp nằm trong khoảng từ startDate đến endDate
        const filteredStatuses = deviceStatus.statuses.filter(status => {
            return status.ts >= startTs && status.ts <= endTs;
        });

        // Trả về các status đã lọc
        res.json({ deviceId: deviceStatus.deviceId, statuses: filteredStatuses });
    } catch (error) {
        console.error(`Error fetching data for device ${deviceId}:`, error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
