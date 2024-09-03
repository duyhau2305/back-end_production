const express = require('express');
const router = express.Router();
const layMauNguyenLieuController = require('../controller/layMauNguyenLieuController');

// Định nghĩa các route cho LayMauNguyenLieu

// Route để tạo mới nguyên liệu
router.post('/', layMauNguyenLieuController.createLayMauNguyenLieu);

// Route để lấy danh sách tất cả các nguyên liệu
router.get('/', layMauNguyenLieuController.getAllLayMauNguyenLieu);

// Route để lấy thông tin một nguyên liệu theo ID
router.get('/:id', layMauNguyenLieuController.getLayMauNguyenLieuById);

// Route để cập nhật thông tin một nguyên liệu theo ID
router.put('/:id', layMauNguyenLieuController.updateLayMauNguyenLieu);

// Route để xóa một nguyên liệu theo ID
router.delete('/:id', layMauNguyenLieuController.deleteLayMauNguyenLieu);

module.exports = router;
