const express = require('express');
const router = express.Router();
const registrationController = require('../controller/registrationController');

// Định nghĩa các tuyến đường cho API đăng ký
router.post('/', registrationController.createRegistration); // Tạo mới đăng ký
router.get('/', registrationController.getAllRegistrations); // Lấy tất cả đăng ký
router.get('/:id', registrationController.getRegistrationById); // Lấy đăng ký theo ID
router.put('/:id', registrationController.updateRegistration); // Cập nhật đăng ký
router.delete('/:id', registrationController.deleteRegistration); // Xóa đăng ký

module.exports = router;
