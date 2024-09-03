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


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
