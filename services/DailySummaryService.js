const DailySummary = require('../models/DailySummary');
const DailyStatus = require('../models/DailyStatus');
const Device = require('../models/Device');
const moment = require('moment');

const generateDailySummary = async (deviceId, date) => {
  try {
    const device = await Device.findOne({ deviceId });
    if (!device) {
      throw new Error('Không tìm thấy thiết bị.');
    }

    const dailyStatus = await DailyStatus.findOne({ deviceId, date });
    if (!dailyStatus || !dailyStatus.intervals) {
      throw new Error('Không tìm thấy dữ liệu cho ngày này.');
    }

    let totalRunTime = 0;
    let totalDownTime = 0;
    const downtimeIntervals = [];

    dailyStatus.intervals.forEach((interval) => {
      const duration = moment(interval.endTime, 'HH:mm').diff(moment(interval.startTime, 'HH:mm'), 'minutes');
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

    const totalOfflineTime = 1440 - totalRunTime - totalDownTime;

    const runPercentage = (totalRunTime / 1440) * 100;
    const downPercentage = (totalDownTime / 1440) * 100;
    const offlinePercentage = (totalOfflineTime / 1440) * 100;

    await DailySummary.findOneAndUpdate(
      { deviceId: device._id, date },
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

    console.log(`Cập nhật tóm tắt cho thiết bị ${device.deviceId} vào ngày ${date} thành công.`);
  } catch (error) {
    console.error('Lỗi khi tạo tóm tắt hàng ngày:', error);
    throw new Error('Lỗi tạo tóm tắt hàng ngày');
  }
};

const getDailySummary = async (deviceId, date) => {
  try {
    const summary = await DailySummary.findOne({ deviceId, date }).populate('deviceId');
    if (!summary) {
      throw new Error('Không tìm thấy bản tóm tắt cho ngày này.');
    }
    return summary;
  } catch (error) {
    console.error('Lỗi khi lấy DailySummary:', error);
    throw new Error('Lỗi hệ thống');
  }
};

module.exports = {
  generateDailySummary,
  getDailySummary,
};
