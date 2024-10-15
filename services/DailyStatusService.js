const DailyStatus = require('../models/DailyStatus');

// Lấy dữ liệu từ MongoDB theo deviceId và khoảng thời gian
const getTelemetryDataFromMongoDB = async (deviceId, startDate, endDate) => {
  try {
    // Tìm dữ liệu trong MongoDB theo deviceId và ngày
    const existingData = await DailyStatus.find({
      deviceId,
      date: { $gte: startDate, $lte: endDate }
    });

    // Nếu có dữ liệu, trả về dữ liệu
    if (existingData.length > 0) {
      return existingData;
    }

    // Nếu không có dữ liệu, trả về thông báo không tìm thấy dữ liệu
    throw new Error('No data available in MongoDB for the specified date range');
  } catch (error) {
    console.error('Error fetching data from MongoDB:', error);
    throw new Error('Error fetching data from MongoDB');
  }
};

module.exports = {
  getTelemetryDataFromMongoDB,
};
