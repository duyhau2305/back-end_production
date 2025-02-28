const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    employeeId: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    plainTextPassword: { type: String, required: false },
    role: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    locked: { type: Boolean, default: false }, 
    createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

module.exports = User;