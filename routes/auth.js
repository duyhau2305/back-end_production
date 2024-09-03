const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getCurrentUser,
  createUser,
  updateUser,
  deleteUser,
  findUser,
} = require('../controller/authController');
const { authMiddleware, adminMiddleware } = require('../middlewares/authMiddleware');

// Route đăng ký người dùng mới
router.post('/register', register);

// Route đăng nhập người dùng
router.post('/login', login);

// Route lấy thông tin người dùng hiện tại
router.get('/user', authMiddleware, getCurrentUser);

// Route tạo người dùng mới (yêu cầu quyền admin)
router.post('/users', authMiddleware, adminMiddleware, createUser);

// Route cập nhật thông tin người dùng (yêu cầu quyền admin)
router.put('/users/:id', authMiddleware, adminMiddleware, updateUser);

// Route xóa người dùng (yêu cầu quyền admin)
router.delete('/users/:id', authMiddleware, adminMiddleware, deleteUser);

// Route tìm người dùng theo username (yêu cầu quyền admin)
router.get('/users/:username', authMiddleware, adminMiddleware, findUser);

module.exports = router;
