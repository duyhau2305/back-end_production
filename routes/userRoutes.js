const express = require('express');
const router = express.Router();
const userController = require('../controller/userController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Route tạo tài khoản admin
router.post('/admin/create', userController.createAdminUser);

// Route đăng nhập
router.post('/login', userController.loginUser);

// Route lấy thông tin người dùng theo ID (yêu cầu xác thực)
router.get('/users/:id', authMiddleware, userController.getUserById);

// Routes quản lý người dùng (yêu cầu quyền admin)
router.get('/users', authMiddleware, adminMiddleware, userController.getUsers);
router.post('/users', authMiddleware, adminMiddleware, userController.createUser);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// Thay đổi trạng thái khóa
router.put('/users/:id/lock', authMiddleware, adminMiddleware, userController.toggleLockUser);

module.exports = router;
