// routes/machineRoutes.js
const express = require('express');
const router = express.Router();
const machineService = require('../services/MachineService')

router.get('/machineDetails', async (req, res) => {
  const { deviceId, deviceName } = req.query;

  try {
    // Gọi service để lấy dữ liệu tổng hợp, không cần startDate và endDate
    const machineDetails = await machineService.getMachineDetails(deviceId, deviceName);
    res.json(machineDetails);
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ service:', error);
    res.status(500).json({ message: 'Lỗi khi lấy dữ liệu từ service' });
  }
});

module.exports = router;
