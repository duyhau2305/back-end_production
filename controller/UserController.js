const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userService = require('../services/UserService');
const User = require('../models/User');

const createAdminUser = async (req, res) => {
    try {
        const adminUser = await userService.createAdminUser(req.body);
        res.status(201).json(adminUser);
    } catch (error) {
        console.error('Error creating admin user:', error.message);
        res.status(400).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        console.log('Login request:', { username, password });

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(400).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng' });
        }

        console.log('User found:', user);

        const isMatch = await bcrypt.compare(password, user.password);
        console.log('Password match:', isMatch);

        if (!isMatch) {
            return res.status(400).json({ message: 'Mật khẩu không đúng' });
        }

        const token = jwt.sign(
            {
                user: {
                    id: user._id,
                    role: user.role,          
                    isAdmin: user.isAdmin,    
                    username: user.username,  
                    email: user.email,
                    name: user.name,        
                    password: user.password  
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '365d' }
        );

        res.status(200).json({ token, user });
    } catch (error) {
        console.error('Lỗi server:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

const createUser = async (req, res) => {
    try {
        const { username, password, email } = req.body;

        if (!username || !password || !email) {
            return res.status(400).json({ message: 'Vui lòng cung cấp đầy đủ tên đăng nhập, mật khẩu và email.' });
        }

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

const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userData = req.body;

        // Kiểm tra nếu có `plainTextPassword` được gửi từ frontend
        if (userData.plainTextPassword) {
            // Hash plainTextPassword và lưu vào trường password
            const salt = await bcrypt.genSalt(10);
            userData.password = await bcrypt.hash(userData.plainTextPassword, salt);

            // Xóa `plainTextPassword` khỏi `userData` trước khi cập nhật
            delete userData.plainTextPassword;
        }

        // Cập nhật người dùng với password đã hash và các trường khác nếu có
        const updatedUser = await User.findByIdAndUpdate(userId, userData, { new: true });

        if (!updatedUser) {
            return res.status(404).json({ message: 'Người dùng không tồn tại.' });
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        console.error('Error updating user:', error.message);
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng.', error: error.message });
    }
};

const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;

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

const getUsers = async (req, res) => {
    try {
        const users = await userService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        console.error('Error fetching users:', error.message);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách người dùng.', error: error.message });
    }
};

const toggleLockUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findById(userId);
        
        if (!user) {
            return res.status(404).json({ message: 'Người dùng không tồn tại' });
        }

        user.locked = !user.locked;
        await user.save();

        res.status(200).json({ message: `Người dùng đã được ${user.locked ? 'khóa' : 'mở khóa'}`, user });
    } catch (error) {
        console.error('Error toggling lock status:', error.message);
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
};

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
