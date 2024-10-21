const moment = require('moment');
const _ = require('lodash');
const DailyStatus = require('../models/DailyStatus');

// Hợp nhất các khoảng thời gian liên tiếp có cùng trạng thái
const mergeIntervals = (intervals) => {
  if (!intervals || intervals.length === 0) return [];

  const sortedIntervals = _.sortBy(intervals, (interval) =>
    moment(interval.startTime, 'YYYY-MM-DD HH:mm:ss')
  );

  const merged = [];
  let currentInterval = sortedIntervals[0];

  for (let i = 1; i < sortedIntervals.length; i++) {
    const nextInterval = sortedIntervals[i];

    if (
      currentInterval.status === nextInterval.status &&
      moment(currentInterval.endTime, 'YYYY-MM-DD HH:mm:ss').isSameOrAfter(
        moment(nextInterval.startTime, 'YYYY-MM-DD HH:mm:ss')
      )
    ) {
      // Gộp các khoảng thời gian nếu trạng thái giống nhau và liên tục
      currentInterval.endTime = moment.max(
        moment(currentInterval.endTime, 'YYYY-MM-DD HH:mm:ss'),
        moment(nextInterval.endTime, 'YYYY-MM-DD HH:mm:ss')
      ).format('YYYY-MM-DD HH:mm:ss');
    } else {
      merged.push(currentInterval);
      currentInterval = nextInterval;
    }
  }

  merged.push(currentInterval);
  return merged;
};

// Xử lý dữ liệu telemetry từ ThingsBoard và lưu vào MongoDB
const processAndSaveTelemetryData = (deviceId, telemetryData) => {
  return new Promise((resolve, reject) => {
    try {
      // Kiểm tra nếu telemetryData không tồn tại
      if (!telemetryData) {
        console.warn(`No telemetry data returned for device: ${deviceId}`);
        return resolve(); // Bỏ qua nếu không có dữ liệu
      }

      // Lấy dữ liệu 'status' hoặc dùng mảng rỗng nếu không có
      const telemetryStatus = telemetryData.status || [];

      // Kiểm tra xem 'status' có phải là mảng và không rỗng
      if (!Array.isArray(telemetryStatus) || telemetryStatus.length === 0) {
        console.warn(`Invalid telemetry format or no data for device: ${deviceId}`);
        return resolve(); // Bỏ qua nếu không có dữ liệu hợp lệ
      }

      // Xử lý dữ liệu thành các khoảng thời gian
      const processedData = telemetryStatus.map(({ ts, value }) => ({
        timestamp: moment(ts), // Chuyển 'ts' thành moment object
        date: moment(ts).format('YYYY-MM-DD'),
        deviceId,
        status: value === '1' ? 'Chạy' : 'Dừng',
        startTime: moment(ts).format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment(ts).format('YYYY-MM-DD HH:mm:ss'),
      }));

      // Sắp xếp dữ liệu theo thời gian
      const sortedData = _.sortBy(processedData, 'timestamp');

      // Tạo các khoảng thời gian liên tiếp
      const intervals = [];
      let currentInterval = sortedData[0];

      for (let i = 1; i < sortedData.length; i++) {
        const current = sortedData[i];

        if (current.status !== currentInterval.status) {
          intervals.push(currentInterval); // Thêm khoảng hiện tại
          currentInterval = current; // Bắt đầu khoảng mới
        } else {
          currentInterval.endTime = current.endTime; // Cập nhật endTime nếu trạng thái không thay đổi
        }
      }

      intervals.push(currentInterval); // Thêm khoảng cuối cùng

      // Nhóm các khoảng theo ngày
      const groupedData = _(intervals)
        .groupBy('date')
        .toPairs()
        .sortBy(([date]) => moment(date, 'YYYY-MM-DD'))
        .fromPairs()
        .value();

      // Lưu dữ liệu vào MongoDB
      const promises = Object.keys(groupedData).map((date) => {
        const mergedIntervals = mergeIntervals(groupedData[date]);

        return DailyStatus.findOne({ deviceId, date })
          .then((existingRecord) => {
            if (existingRecord) {
              existingRecord.intervals = mergedIntervals;
              return existingRecord.save();
            } else {
              const newDailyStatus = new DailyStatus({
                deviceId,
                date,
                intervals: mergedIntervals,
              });
              return newDailyStatus.save();
            }
          });
      });

      Promise.all(promises)
        .then(() => {
          console.log(`Telemetry data for device ${deviceId} saved successfully`);
          resolve();
        })
        .catch((error) => {
          console.error('Error saving telemetry data:', error);
          reject(new Error('Error saving telemetry data'));
        });
    } catch (error) {
      console.error('Error processing telemetry data:', error);
      reject(new Error('Error processing telemetry data'));
    }
  });
};


module.exports = {
  processAndSaveTelemetryData,
};
