// Import các thư viện cần thiết
const express = require('express');
const axios = require('axios');
const DeviceStatus = require('./models/DeviceStatus'); // Đảm bảo đường dẫn đúng với mô hình của bạn
const connectDB = require('./config/db'); // Kết nối đến MongoDB
const dotenv = require('dotenv');

dotenv.config(); // Tải các biến môi trường từ tệp .env

const app = express();
const PORT = process.env.PORT || 3000; // Cổng mà server sẽ chạy

// Kết nối đến MongoDB
connectDB();

// Biến để lưu token
let accessToken = '';

// Hàm lấy token từ ThingsBoard
const getAccessToken = async () => {
    try {
        const response = await axios.post('http://cloud.datainsight.vn:8080/api/auth/login', {
            username: process.env.TB_USERNAME, // Thay đổi với tên đăng nhập của bạn
            password: process.env.TB_PASSWORD  // Thay đổi với mật khẩu của bạn
        });
        accessToken = response.data.token; // Lưu token
        console.log('Access Token:', accessToken);
    } catch (error) {
        console.error('Error getting access token:', error.message);
    }
};

// Hàm để lấy dữ liệu từ ThingsBoard và lưu vào MongoDB
const importDataFromThingsBoard = async (deviceIds) => {
    const startTs = 1726477477000; // Thời gian bắt đầu
    const endTs = 1727082900016; // Thời gian kết thúc
    const interval = 3600; // Khoảng thời gian (giây)
    const limit = 50000; // Giới hạn số lượng dữ liệu

    for (const deviceId of deviceIds) {
        try {
            const response = await axios.get(`http://cloud.datainsight.vn:8080/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries`, {
                params: {
                    keys: 'status',
                    interval: interval,
                    limit: limit,
                    startTs: startTs,
                    endTs: endTs,
                },
                headers: {
                    'X-Authorization': `Bearer ${accessToken}` // Thêm token vào header
                }
            });

            const statusData = response.data.status; // Dữ liệu lấy từ ThingsBoard
            console.log(`Response for device ${deviceId}:`, response.data);

            
            // Kiểm tra xem statusData có tồn tại và có phải là một mảng không
            if (!statusData || !Array.isArray(statusData) || statusData.length === 0) {
                console.error(`No status data found for device ${deviceId}. Response:`, response.data);
                continue; // Bỏ qua nếu không có dữ liệu
            }

            // Lưu dữ liệu vào MongoDB
            const existingDeviceStatus = await DeviceStatus.findOne({ deviceId });

            if (existingDeviceStatus) {
                // Cập nhật status mới
                existingDeviceStatus.statuses.push(...statusData);
                await existingDeviceStatus.save();
                console.log(`Updated status for device ${deviceId}`);
            } else {
                // Tạo mới nếu thiết bị chưa tồn tại
                const newDeviceStatus = new DeviceStatus({
                    deviceId,
                    statuses: statusData,
                });
                await newDeviceStatus.save();
                console.log(`Created new status for device ${deviceId}`);
            }
        } catch (error) {
            console.error(`Error importing data for device ${deviceId}:`, error.message);
        }
    }
};

// Gọi hàm lấy token trước khi khởi động server
const startServer = async () => {
    await getAccessToken(); // Lấy token trước khi khởi động server

    // Gọi hàm importDataFromThingsBoard với danh sách deviceId
    const deviceIds = [
        '543ff470-54c6-11ef-8dd4-b74d24d26b24', //May dap dong tam
        // Thêm các deviceId khác nếu cần
    ];

    app.listen(PORT, async () => {
        console.log(`Server is running on port ${PORT}`);
        await importDataFromThingsBoard(deviceIds); // Gọi hàm để lấy dữ liệu khi khởi động
    });
};

startServer(); // Khởi động server
