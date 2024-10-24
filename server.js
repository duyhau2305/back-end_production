const express = require('express');
const axios = require('axios');
const cron = require('node-cron');
const { getTelemetryDataFromTB , loginAndGetAccessToken } = require('./services/ThingboardService');
const { processAndSaveTelemetryData, caculateData } = require('./services/TelemetryProcessingService');
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
const downtimeRoute = require('./routes/DowntimeRoute')

const startDate = moment().format('YYYY-MM-DD');
const endDate = moment().format('YYYY-MM-DD');
const dailyStatusRoutes = require('./routes/DailyStatusRoutes');
const dailyStatusService = require('./services/DailyStatusService');
const WorkshiftsR = require('./models/WorkshiftsR');
const AvailabilityRealtime = require('./models/AvailabilityRealtime');
const AvailabilityHour = require('./models/AvailabilityHour');
const AvailabilityDay = require('./models/AvailabilityDay');

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

    // Danh sách các deviceId cần lấy dữ liệu
    const deviceIds = [
      '543ff470-54c6-11ef-8dd4-b74d24d26b24',
      'a7f6e950-5a68-11ef-8dd4-b74d24d26b24',
      'db8d2550-db6e-11ee-87ab-f7f4ba6ad581'
    ];
    const startDate = Date.now() - 45 * 24 * 60 * 60 * 1000; // Lấy dữ liệu trong vòng 1 năm
    const endDate = Date.now(); // Thời điểm hiện tại

    // Đăng nhập và lấy token trước khi gọi API
    const accessToken = await loginAndGetAccessToken();

    let telemetryData = await getTelemetryDataFromTB(deviceId, startOfDay.getTime(), endDate, accessToken);
    await processAndSaveTelemetryData(deviceId, telemetryData , 'day');
    console.log('Telemetry data saved successfully');
  } catch (error) {
    console.error('Failed to fetch and save telemetry data:', error.message);
  }
};
const fetchAndSaveTelemetryDataType = async (type) => {
  try {
    console.log('Fetching and saving telemetry data...');
    const now = new Date();
    let startOfDay; 
    let endDate;
    if(type == 'day'){
      console.log(startOfDay)

      startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      endDate = now.getTime();
    }else if(type == '1h'){
      startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
      endDate = now.getTime();
    }else{
      startOfDay = new Date(now.getTime() - 15 * 60 * 1000);

      endDate = now.getTime();
    }
    const deviceId = '543ff470-54c6-11ef-8dd4-b74d24d26b24';
    const accessToken = await loginAndGetAccessToken();

    let telemetryData = await getTelemetryDataFromTB(deviceId, startOfDay.getTime(), endDate, accessToken);
    await processAndSaveTelemetryData(deviceId, telemetryData , type);
    console.log('Telemetry data saved successfully');
  } catch (error) {
    console.error('Failed to fetch and save telemetry data:', error.message);
  }
};

function scheduleTask(interval) {

  let cronExpression = '';

  if (interval === '15min') {
      cronExpression = '*/15 * * * *'; // Mỗi 15 phút
  } else if (interval === '1h') {
      cronExpression = '0 * * * *'; // Mỗi giờ (vào phút thứ 0)
  } else if (interval === 'day') {
      cronExpression = '0 0 * * *'; // Mỗi ngày (vào 00:00 giờ)
  } else {
      throw new Error('Invalid interval provided');
  }

  cron.schedule(cronExpression, () => {
    fetchAndSaveTelemetryDataType(interval);
  });
}

scheduleTask('15min'); 
scheduleTask('1h'); 
scheduleTask('day');

fetchAndSaveTelemetryData()

app.use('/api', dailyStatusRoutes);
app.use('/api/device-status', deviceStatusRoute);
app.use('/api', userRouters);
app.use('/api/areas', areaRoutes);
app.use('/api/device', deviceRouters)
app.use('/api/issue', issueRouters)
app.use('/api/employees', employeeRoutes);
app.use('/api/workShifts', workShiftRoutes); 
app.use('/api/productiontask', productionTasktRoutes); 
app.use('/api/downtime',downtimeRoute)
app.listen(PORT, '0.0.0.0', () => {
  const ipAddress = getIPAddress();
  console.log(`Server is running on http://${ipAddress}:${PORT}`);
});
