// src/routes/phulieuRoutes.js
const express = require('express');
const router = express.Router();
const layMauPhuLieuController = require('../controller/layMauPhuLieuController');

// Route lấy tất cả vật liệu
router.get('/', layMauPhuLieuController.getAllLayMauPhuLieu);

// Route thêm mới vật liệu
router.post('/', layMauPhuLieuController.createLayMauPhuLieu);

// Route cập nhật vật liệu theo ID
router.put('/:id', layMauPhuLieuController.updateLayMauPhuLieu);

// Route xóa vật liệu theo ID
router.delete('/:id', layMauPhuLieuController.deleteLayMauPhuLieu);

router.get('/kNumber/:kNumber', layMauPhuLieuController.getLayMauPhuLieuByKNumber);


module.exports = router;
