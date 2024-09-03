const express = require('express');
const serverless = require('serverless-http');
const app = express();
const router = require('../routes/userRoutes'); // Import router của bạn

app.use('/api', router); // Kết nối các route của bạn với đường dẫn /api

module.exports.handler = serverless(app);
