const express = require('express');
const router = express.Router();
const os = require('os');
const userController = require('../controller/UserController');
const { authMiddleware, adminMiddleware } = require('../middlewares/AuthMiddleware');

// Route  create adminuser
router.post('/admin/create', userController.createAdminUser);

router.post('/login', userController.loginUser);

// Route get info user by ID ( require Admin)
router.get('/users/:id', authMiddleware, userController.getUserById);

// Routes user management( require Admin)
router.get('/users', authMiddleware, adminMiddleware, userController.getUsers);
router.post('/users', authMiddleware, adminMiddleware, userController.createUser);
router.put('/users/:id', authMiddleware, userController.updateUser);
router.delete('/users/:id', authMiddleware, adminMiddleware, userController.deleteUser);

// Change status lock user
router.put('/users/:id/lock', authMiddleware, adminMiddleware, userController.toggleLockUser);

module.exports = router;
