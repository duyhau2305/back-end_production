const express = require('express');
const connectDB = require('./config/db');
const userRoutes = require('./routes/userRoutes');
const dotenv = require('dotenv');
const cors = require('cors');

dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware để xử lý JSON
app.use(express.json());

// Middleware để xử lý CORS
app.use(cors());

// Sử dụng routes
app.use('/api', userRoutes);

// Sử dụng cổng từ file .env hoặc mặc định là 5000
const PORT = process.env.PORT || 5000;

// Chạy server và lắng nghe trên tất cả các IP (0.0.0.0)
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on IP: 0.0.0.0 and port ${PORT}`);
});
