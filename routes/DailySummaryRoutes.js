const express = require('express');
const { getDailySummary } = require('../controller/DailySummaryController');

const router = express.Router();

// Lấy bản tóm tắt hàng ngày theo deviceId và date
router.get('/:deviceId/:date', getDailySummary);

module.exports = router;
