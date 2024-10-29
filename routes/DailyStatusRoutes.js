const express = require('express');
const router = express.Router();
const { getTelemetryData, getDataTotalDeviceStatus, updateTask, getProcessDevice, getMachineOperations, getFromDeviceStatus } = require('../controller/DailyStatusController');

// Route để lấy dữ liệu từ MongoDB
router.get('/telemetry', getTelemetryData);
router.get('/totaltop', getDataTotalDeviceStatus);
router.get('/updateTask', updateTask);
router.get('/getprocessdata', getProcessDevice);
router.get('/getMachine', getMachineOperations);
router.get('/getFromDeviceStatus', getFromDeviceStatus);

module.exports = router;