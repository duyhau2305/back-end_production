const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// Create User
const createUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newUser = new User({
        ...userData,
        password: hashedPassword,
        plainTextPassword: userData.password // Store plain text password
    });

    return await newUser.save();
};

// Create Admin User
const createAdminUser = async (userData) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    const newAdmin = new User({
        ...userData,
        password: hashedPassword,
        plainTextPassword: userData.password, // Store plain text password
        isAdmin: true
    });

    return await newAdmin.save();
};

// Update User
const updateUser = async (userId, userData) => {
    // Check if plainTextPassword is sent from frontend
    if (userData.plainTextPassword) {
        // Keep plainTextPassword for display
        userData.plainTextPassword = userData.plainTextPassword;

        // Hash plainTextPassword and store in password field
        const salt = await bcrypt.genSalt(10);
        userData.password = await bcrypt.hash(userData.plainTextPassword, salt);
    }

    // Update user with plainTextPassword for display and hashed password for security
    return await User.findByIdAndUpdate(userId, userData, { new: true });
};

// Toggle User Lock Status
const toggleLockUser = async (userId) => {
    try {
        const user = await User.findById(userId);

        if (!user) {
            throw new Error('User not found');
        }

        // Toggle the locked status
        user.locked = !user.locked;
        await user.save();

        return user;
    } catch (error) {
        throw new Error('Error toggling lock status: ' + error.message);
    }
};

// Delete User
const deleteUser = async (userId) => {
    return await User.findByIdAndDelete(userId);
};

// Get All Users
const getUsers = async () => {
    return await User.find();
};

// Get User by ID
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

// Login User
const loginUser = async (username, password) => {
    try {
        const user = await User.findOne({ username });

        if (!user) {
            throw new Error('Invalid username or password');
        }

        // Check if user account is locked
        if (user.locked) {
            throw new Error('Your account is locked. Please contact an administrator.');
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
            { expiresIn: '365d' } // Token expires in 12 hours
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
    toggleLockUser, // Exporting the new function
    deleteUser,
    getUsers,
    getUserById,
    loginUser
};
