const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/userService');
const User = require('../models/User');

// Tạo tài khoản admin
const createAdminUser = async (req, res) => {
    try {
        const adminUser = await userService.createAdminUser(req.body);
        res.status(201).json(adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Đăng nhập người dùng
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login request:', { username, password });

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập không đúng' });
        }

        console.log('User found:', user);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        // Tạo token chứa các thông tin yêu cầu
        const token = jwt.sign(
            {
                user: {
                    id: user._id,
                    role: user.role,          
                    isAdmin: user.isAdmin,    
                    username: user.username,  
                    email: user.email,        
                    password: user.password  
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '12h' }
        );

        res.status(200).json({ token, user });
    } catch (error) {
        console.error('Lỗi server:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};


// Tạo người dùng mới
const createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        // Kiểm tra nếu thông tin cơ bản không được cung cấp
        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên đăng nhập, mật khẩu và email.' });
        }

        // Kiểm tra nếu người dùng đã tồn tại
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại.' });
        }

        const user = await userService.createUser(req.body);
        res.status(201).json(user);
    } catch (error) {
        console.error('Error creating user:', error.message);
        res.status(400).json({ message: error.message });
    }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const currentUser = req.user;

        // Kiểm tra nếu người dùng không phải admin và đang cố gắng cập nhật tài khoản khác
        if (!currentUser.isAdmin && currentUser.id !== userId) {
            return res.status(403).json({ message: 'Không có quyền cập nhật thông tin người dùng này.' });
        }

        const updatedUser = await User.findByIdAndUpdate(userId, req.body, { new: true });
        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Lỗi khi cập nhật thông tin người dùng.', error: error.message });
    }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Kiểm tra nếu người dùng không tồn tại
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        await userService.deleteUser(userId);
        res.status(204).json({ message: 'Người dùng đã được xóa.' });
    } catch (error) {
        console.error('Error deleting user:', error.message);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng.', error: error.message });
    }
};

// Lấy danh sách người dùng
const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng.', error: error.message });
    }
};

// Khóa/Mở khóa người dùng
const toggleLockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        // Đảo ngược trạng thái khóa
        user.locked = !user.locked;
        await user.save();

        res.status(200).json({ message: `Người dùng đã được ${user.locked ? 'khóa' : 'mở khóa'}`, user });
    } catch (error) {
        console.error('Error toggling lock status:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }
        res.status(200).json(user);
    } catch (error) {
        console.error('Error fetching user by ID:', error.message);
        res.status(500).json({ message: 'Lỗi khi lấy thông tin người dùng.', error: error.message });
    }
};

module.exports = {
    createAdminUser,
    loginUser,
    createUser,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
    toggleLockUser,
};
