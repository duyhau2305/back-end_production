const express = require('express');
const router = express.Router();
const areaController = require('../controller/areaController');

// Endpoint thêm khu vực
router.post('/areas', areaController.createArea);

// Endpoint lấy danh sách khu vực
router.get('/areas', areaController.getAreas);

// Endpoint sửa thông tin khu vực
router.put('/areas/:id', areaController.updateArea);

// Endpoint xóa khu vực
router.delete('/areas/:id', areaController.deleteArea);

module.exports = router;
