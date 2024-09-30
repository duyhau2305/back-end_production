const express = require('express');
const router = express.Router();
const DeviceStatus = require('../models/DeviceStatus'); // Đảm bảo đường dẫn đúng với mô hình của bạn

// Route để lấy dữ liệu từ MongoDB cho frontend
router.get('/:deviceId', async (req, res) => {
    const { deviceId } = req.params;

    try {
        // Tìm trạng thái của thiết bị theo deviceId
        const deviceStatus = await DeviceStatus.findOne({ deviceId });

        if (!deviceStatus) {
            return res.status(404).json({ message: 'Device not found' });
        }

        // Trả về dữ liệu trạng thái của thiết bị
        res.json(deviceStatus);
    } catch (error) {
        console.error(`Error fetching data for device ${deviceId}:`, error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
