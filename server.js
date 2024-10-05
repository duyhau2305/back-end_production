// Import các thư viện cần thiết
const express = require('express');
const axios = require('axios');
const connectDB = require('./config/db'); // Kết nối đến MongoDB
// const DeviceStatus = require('./models/DeviceStatus');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouters = require('./routes/userRoutes');
const  areaRoutes =require('./routes/areaRouter')

const deviceStatusRoute = require('./routes/deviceStatusRoute'); // Import route mới tạo

dotenv.config(); // Tải các biến môi trường từ tệp .env

const app = express();
const PORT = process.env.PORT || 3000; // Cổng mà server sẽ chạy
app.use(cors());
app.use(express.json());



// Kết nối đến MongoDB
connectDB();

app.use('/api/device-status', deviceStatusRoute);
app.use('/api', userRouters);
app.use('/api/areas', areaRoutes);

  app.listen(PORT,  () => {
    console.log(`Server is running on ${PORT}`);
    
  });
