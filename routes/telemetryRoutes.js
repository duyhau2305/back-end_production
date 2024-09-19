const express = require('express');
const axios = require('axios');
const Telemetry = require('../models/Telemetry');
const router = express.Router();

// Route để lấy dữ liệu từ API bên ngoài và lưu vào MongoDB
router.get('/fetch', async (req, res) => {
  try {
    console.log('Đang lấy dữ liệu từ API...'); // Thông báo khi bắt đầu lấy dữ liệu

    const response = await axios.get(process.env.DEVICE_URL, {
      headers: {
        'Authorization': `Bearer ${process.env.TOKEN}`,
      },
    });

    const telemetryData = response.data;

    // Duyệt qua dữ liệu và lưu vào MongoDB
    for (const key in telemetryData) {
      if (telemetryData.hasOwnProperty(key)) {
        telemetryData[key].forEach(async (entry) => {
          const newTelemetry = new Telemetry({
            key: key,
            value: entry.value,
            ts: new Date(entry.ts),
          });

          await newTelemetry.save();
          console.log(`Đã lưu dữ liệu với key: ${key}, value: ${entry.value}, timestamp: ${new Date(entry.ts)}`); // Thông báo dữ liệu đã lưu vào MongoDB
        });
      }
    }

    res.json({ message: 'Dữ liệu đã được lưu vào MongoDB' });
    console.log('Dữ liệu đã được lưu thành công vào MongoDB!'); // Thông báo khi hoàn thành việc lưu
  } catch (error) {
    console.error('Error fetching telemetry data:', error);
    res.status(500).json({ error: 'Lỗi khi lấy dữ liệu' });
  }
});

module.exports = router;
