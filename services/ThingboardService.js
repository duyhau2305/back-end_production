const axios = require('axios');

const THINGBOARD_API_URL = 'http://cloud.datainsight.vn:8080';
const USERNAME = 'oee2024@gmail.com';
const PASSWORD = 'Oee@2124';

// Hàm đăng nhập để lấy access token từ ThingBoard
const loginAndGetAccessToken = async () => {
  try {
    const response = await axios.post(`${THINGBOARD_API_URL}/api/auth/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    const accessToken = response.data.token;
    console.log('Access token received:', accessToken); // Log để kiểm tra token
    return accessToken;
  } catch (error) {
    console.error('Failed to get access token:', error.message);
    throw new Error('Failed to get access token');
  }
};

// Hàm gọi API lấy dữ liệu telemetry từ ThingBoard
const getTelemetryDataFromTB = async (deviceId, startDate, endDate, accessToken) => {
  try {
    const response = await axios.get(
      `${THINGBOARD_API_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=status&interval=300000&limit=10000&startTs=${startDate}&endTs=${endDate}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.status; 
  } catch (error) {
    console.error('Failed to fetch telemetry data:', error.message);
    throw new Error('Failed to fetch telemetry data');
  }
};

module.exports = {
  loginAndGetAccessToken,
  getTelemetryDataFromTB,
};
