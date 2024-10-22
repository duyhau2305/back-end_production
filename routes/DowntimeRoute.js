const express = require('express');
const router = express.Router();
const downtimeController = require('../controller/DowntimeController');

// Lấy tất cả downtime với bộ lọc deviceID và khoảng thời gian
router.get('/', downtimeController.getDowntimesByFilter);

// Tạo downtime mới
router.post('/', downtimeController.createDowntime);

// Cập nhật downtime theo ID
router.put('/:id', downtimeController.updateDowntime);

// Xóa downtime theo ID
router.delete('/:id', downtimeController.deleteDowntime);

module.exports = router;
