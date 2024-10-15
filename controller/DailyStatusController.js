const { getTelemetryDataFromMongoDB } = require('../services/DailyStatusService');

// Controller để xử lý yêu cầu lấy dữ liệu từ MongoDB
const getTelemetryData = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;

  try {
    // Gọi service để lấy dữ liệu từ MongoDB
    const data = await getTelemetryDataFromMongoDB(deviceId, startDate, endDate);
    // Trả về dữ liệu cho client
    res.status(200).json(data);
  } catch (error) {
    // Nếu không tìm thấy dữ liệu hoặc có lỗi, trả về lỗi
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getTelemetryData,
};
