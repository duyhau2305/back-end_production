// Import các thư viện cần thiết
const express = require('express');
const axios = require('axios');
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
const deviceId = '543ff470-54c6-11ef-8dd4-b74d24d26b24';
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

//recorData
const recordTelemetryData = async () => {
  try {
    console.log('Fetching telemetry data...');
    await dailyStatusService.processTelemetryData(deviceId, startDate, endDate);
    console.log('Telemetry data saved successfully');
  } catch (error) {
    console.error('Error recording telemetry data:', error.message);
  }
};
recordTelemetryData();
setInterval(() => {
  recordTelemetryData();
}, 10 * 60 * 1000); 


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
