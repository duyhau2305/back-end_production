// Import các thư viện cần thiết
const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const { getTelemetryDataFromTB , loginAndGetAccessToken } = require('./services/ThingboardService');
const { processAndSaveTelemetryData } = require('./services/TelemetryProcessingService');
const connectDB = require('./config/db'); 
const cors = require('cors');
const os = require('os');
const moment = require('moment');
const dotenv = require('dotenv');
const userRouters = require('./routes/UserRoutes');
const  areaRoutes =require('./routes/AreaRouter');
const  deviceRouters =require('./routes/DeviceRouter');
const deviceStatusRoute = require('./routes/DeviceStatusRoute'); 
const issueRouters =require('./routes/IssueRouter');
const  employeeRoutes =require('./routes/EmployeeRoutes');
const workShiftRoutes = require('./routes/WorkShiftRoutes')
const productionTasktRoutes = require('./routes/ProductionTaskRouter')

const startDate = moment().format('YYYY-MM-DD');
const endDate = moment().format('YYYY-MM-DD');
const dailyStatusRoutes = require('./routes/DailyStatusRoutes');
const dailyStatusService = require('./services/DailyStatusService');

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000; 
app.use(cors());
app.use(express.json());

const getIPAddress = () => {
  const interfaces = os.networkInterfaces();
  for (let iface in interfaces) {
    for (let alias of interfaces[iface]) {
      if (alias.family === 'IPv4' && !alias.internal) {
        return alias.address;
      }
    }
  }
  return '0.0.0.0';
};

connectDB();


const fetchAndSaveTelemetryData = async () => {
  try {
    console.log('Fetching and saving telemetry data...');
    
    const deviceId = '543ff470-54c6-11ef-8dd4-b74d24d26b24';
    const startDate = Date.now() - 365 * 24 * 60 * 60 * 1000; // Lấy dữ liệu trong vòng 1 năm
    const endDate = Date.now(); // Thời điểm hiện tại

    // Đăng nhập và lấy token trước khi gọi API
    const accessToken = await loginAndGetAccessToken();

    // Gọi API lấy dữ liệu từ ThingBoard sử dụng token vừa nhận
    const telemetryData = await getTelemetryDataFromTB(deviceId, startDate, endDate, accessToken);

    // Xử lý và lưu dữ liệu vào MongoDB
    await processAndSaveTelemetryData(deviceId, telemetryData);

    console.log('Telemetry data saved successfully');
  } catch (error) {
    console.error('Failed to fetch and save telemetry data:', error.message);
  }
};


cron.schedule('0 * * * *', fetchAndSaveTelemetryData);


fetchAndSaveTelemetryData(); 

app.use('/api', dailyStatusRoutes);
app.use('/api/device-status', deviceStatusRoute);
app.use('/api', userRouters);
app.use('/api/areas', areaRoutes);
app.use('/api/device', deviceRouters)
app.use('/api/issue', issueRouters)
app.use('/api/employees', employeeRoutes);
app.use('/api/workShifts', workShiftRoutes); 
app.use('/api/productiontask', productionTasktRoutes); 

app.listen(PORT, '0.0.0.0', () => {
  const ipAddress = getIPAddress();
  console.log(`Server is running on http://${ipAddress}:${PORT}`);
});
