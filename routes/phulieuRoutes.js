// src/routes/phulieuRoutes.js
const express = require('express');
const router = express.Router();
const phuLieuController = require('../controller/phulieuController');

// Route lấy tất cả vật liệu
router.get('/', phuLieuController.getAllPhuLieus);

// Route thêm mới vật liệu
router.post('/', phuLieuController.createPhuLieu);

// Route cập nhật vật liệu theo ID
router.put('/:id', phuLieuController.updatePhuLieu);

// Route xóa vật liệu theo ID
router.delete('/:id', phuLieuController.deletePhuLieu);

module.exports = router;
