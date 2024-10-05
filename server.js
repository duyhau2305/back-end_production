// Import các thư viện cần thiết
const express = require('express');
const axios = require('axios');
const connectDB = require('./config/db'); // Kết nối đến MongoDB
// const DeviceStatus = require('./models/DeviceStatus');
const cors = require('cors');
const dotenv = require('dotenv');
const userRouters = require('./routes/UserRoutes');
const  areaRoutes =require('./routes/AreaRouter')
const  deviceRouters =require('./routes/DeviceRouter')
const deviceStatusRoute = require('./routes/DeviceStatusRoute'); 

dotenv.config(); 

const app = express();
const PORT = process.env.PORT || 3000; 
app.use(cors());
app.use(express.json());



// Kết nối đến MongoDB
connectDB();

app.use('/api/device-status', deviceStatusRoute);
app.use('/api', userRouters);
app.use('/api/areas', areaRoutes);
app.use('/api/device', deviceRouters)

  app.listen(PORT,  () => {
    console.log(`Server is running on ${PORT}`);
    
  });
