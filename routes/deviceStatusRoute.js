const express = require('express');
const router = express.Router();
const DeviceStatus = require('../models/DeviceStatus'); // Import model

// Route để lấy dữ liệu từ MongoDB và lọc theo khoảng thời gian
router.get('/:deviceId', async (req, res) => {
    const { deviceId } = req.params;
    const { startDate, endDate } = req.query; // Lấy startDate và endDate từ query string

    try {
        // Chuyển đổi startDate và endDate thành dạng số (timestamp)
        const startTs = parseInt(startDate);  // Timestamp tính theo milliseconds
        const endTs = parseInt(endDate);      // Timestamp tính theo milliseconds

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

        // Tạo mảng chứa các dữ liệu đã tính toán thời gian
        const processedData = filteredStatuses.map((status, index, arr) => {
            const startTime = status.ts; // Thời gian bắt đầu là timestamp hiện tại

            // Thời gian kết thúc là timestamp của trạng thái tiếp theo hoặc endDate nếu là trạng thái cuối cùng
            const endTime = (arr[index + 1] && arr[index + 1].ts) ? arr[index + 1].ts : endTs;

            return {
                date: new Date(status.ts).toLocaleDateString(), // Chuyển đổi timestamp sang ngày
                startTime: new Date(startTime).toLocaleTimeString(), // Chuyển đổi sang thời gian bắt đầu
                endTime: new Date(endTime).toLocaleTimeString(), // Chuyển đổi sang thời gian kết thúc
                status: status.value === '1' ? 'Chạy' : 'Dừng' // Chuyển đổi trạng thái
            };
        });

        // Trả về dữ liệu đã xử lý
        res.json({ deviceId: deviceStatus.deviceId, statuses: processedData });
    } catch (error) {
        console.error(`Error fetching data for device ${deviceId}:`, error.message);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
