const moment = require('moment');
const _ = require('lodash');
const DailyStatus = require('../models/DailyStatus');

const processAndMergeIntervals = (telemetryData) => {
  // Sắp xếp dữ liệu theo timestamp từ thấp đến cao
  const sortedData = _.sortBy(telemetryData, (item) => item.ts);

  const mergedIntervals = [];
  let currentInterval = {
    status: sortedData[0].value === '1' ? 'Chạy' : 'Dừng',
    startTime: moment(sortedData[0].ts).format('HH:mm:ss'),
  };

  // Duyệt qua các phần tử sau khi sắp xếp
  for (let i = 1; i < sortedData.length; i++) {
    const currentStatus = sortedData[i].value === '1' ? 'Chạy' : 'Dừng';
    const currentTimestamp = moment(sortedData[i].ts).format('HH:mm:ss');

    // Nếu trạng thái khác nhau, kết thúc khoảng hiện tại và bắt đầu khoảng mới
    if (currentStatus !== currentInterval.status) {
      currentInterval.endTime = currentTimestamp;
      mergedIntervals.push(currentInterval);

      // Tạo khoảng thời gian mới
      currentInterval = {
        status: currentStatus,
        startTime: currentTimestamp,
      };
    }
  }

  // Đóng khoảng thời gian cuối cùng
  currentInterval.endTime = moment(sortedData[sortedData.length - 1].ts).format('HH:mm:ss');
  mergedIntervals.push(currentInterval);

  return mergedIntervals;
};

const processAndSaveTelemetryData = async (deviceId, telemetryData) => {
  try {
    // Nhóm dữ liệu theo từng ngày
    const groupedData = _(telemetryData)
      .groupBy((item) => moment(item.ts).format('YYYY-MM-DD'))
      .toPairs()
      .sortBy(([date]) => moment(date, 'YYYY-MM-DD'))
      .fromPairs()
      .value();

    const promises = Object.keys(groupedData).map(async (date) => {
      // Sắp xếp và hợp nhất các khoảng thời gian
      const mergedIntervals = processAndMergeIntervals(groupedData[date]);

      // Kiểm tra và cập nhật cơ sở dữ liệu
      const existingRecord = await DailyStatus.findOne({ deviceId, date });
      if (existingRecord) {
        existingRecord.intervals = mergedIntervals;
        await existingRecord.save();
      } else {
        const newDailyStatus = new DailyStatus({
          deviceId,
          date,
          intervals: mergedIntervals,
        });
        await newDailyStatus.save();
      }
    });

    await Promise.all(promises);
  } catch (error) {
    console.error('Error processing and saving telemetry data:', error);
    throw new Error('Error saving telemetry data');
  }
};

module.exports = {
  processAndSaveTelemetryData,
};
