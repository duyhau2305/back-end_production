const mongoose = require('mongoose');
const moment = require('moment');
const DailyStatus = require('../models/DailyStatus'); // Import model DailyStatus
const DailySummary = require('../models/DailySummary'); // Import model DailySummary

// Hàm tạo DailySummary từ DailyStatus
const generateDailySummary = async (deviceId, date) => {
  try {
    // Tìm trạng thái hàng ngày dựa trên deviceId và date
    const dailyStatus = await DailyStatus.findOne({ deviceId, date });

    if (!dailyStatus || !dailyStatus.intervals) {
      throw new Error('Không tìm thấy dữ liệu trạng thái cho ngày này.');
    }

    let totalRunTime = 0;
    let totalDownTime = 0;
    const downtimeIntervals = [];

    // Duyệt qua các khoảng thời gian (intervals) và tính toán
    dailyStatus.intervals.forEach((interval) => {
      const duration = moment(interval.endTime, 'HH:mm').diff(
        moment(interval.startTime, 'HH:mm'),
        'minutes'
      );

      if (interval.status === 'Chạy') {
        totalRunTime += duration;
      } else if (interval.status === 'Dừng') {
        totalDownTime += duration;
        downtimeIntervals.push({
          startTime: interval.startTime,
          endTime: interval.endTime,
          duration,
        });
      }
    });

    // Tính toán thời gian offline
    const totalOfflineTime = 1440 - totalRunTime - totalDownTime;

    // Tính toán phần trăm thời gian
    const runPercentage = (totalRunTime / 1440) * 100;
    const downPercentage = (totalDownTime / 1440) * 100;
    const offlinePercentage = (totalOfflineTime / 1440) * 100;

    // Cập nhật hoặc tạo bản ghi tóm tắt hàng ngày (DailySummary)
    await DailySummary.findOneAndUpdate(
      { deviceId, date },
      {
        downtimeIntervals,
        totalRunTime,
        totalDownTime,
        totalOfflineTime,
        runPercentage,
        downPercentage,
        offlinePercentage,
      },
      { upsert: true, new: true }
    );

    console.log(`Tạo bản tóm tắt hàng ngày cho thiết bị ${deviceId} vào ngày ${date} thành công.`);
  } catch (error) {
    console.error('Lỗi khi tạo tóm tắt hàng ngày:', error.message);
    throw new Error('Lỗi tạo tóm tắt hàng ngày');
  }
};

module.exports = {
  generateDailySummary,
};
