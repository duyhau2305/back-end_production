const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');


const createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = new User({
        ...userData,
        password: hashedPassword
    });

    return await newUser.save();
};


const createAdminUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newAdmin = new User({
        ...userData,
        password: hashedPassword,
        isAdmin: true
    });

    return await newAdmin.save();
};


const updateUser = async (userId, userData) => {
    if (userData.password) {
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.password, salt);
    }

    return await User.findByIdAndUpdate(userId, userData, { new: true });
};


const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};


const getUsers = async () => {
    return await User.find();
};


const getUserById = async (id) => {
    try {
        const user = await User.findById(id);
        if (!user) {
            throw new Error('User not found');
        }
        return user;
    } catch (error) {
        throw new Error('Error fetching user by ID: ' + error.message);
    }
};


const loginUser = async (username, password) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('Invalid username or password');
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            throw new Error('Invalid username or password');
        }

     
        const token = jwt.sign(
            {
                user: {
                    id: user._id,
                    isAdmin: user.isAdmin,
                    username: user.username,
                    role: user.role,
                    name: user.name
                }
            },
            process.env.JWT_SECRET,
            { expiresIn: '5h' } // Token sẽ hết hạn sau 5 giờ
        );

        return { token, user };
    } catch (error) {
        throw new Error('Login failed: ' + error.message);
    }
};

module.exports = {
    createUser,
    createAdminUser,
    updateUser,
    deleteUser,
    getUsers,
    getUserById,
    loginUser
};
