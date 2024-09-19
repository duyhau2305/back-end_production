const express = require('express');
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
const telemetryRoutes = require('./routes/telemetryRoutes');

dotenv.config();

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware để xử lý JSON và CORS
app.use(express.json());
app.use(cors());

// Sử dụng routes telemetry
app.use('/api/telemetry', telemetryRoutes);

// Cấu hình cổng
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on IP: 0.0.0.0 and port ${PORT}`);
});
