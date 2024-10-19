const moment = require('moment');
const _ = require('lodash');
const DailyStatus = require('../models/DailyStatus');

const mergeIntervals = (intervals) => {
  if (!intervals || intervals.length === 0) return [];

  const sortedIntervals = _.sortBy(intervals, interval => moment(interval.startTime, 'HH:mm'));

  const merged = [];
  let currentInterval = sortedIntervals[0];

  for (let i = 1; i < sortedIntervals.length; i++) {
    const nextInterval = sortedIntervals[i];

    // Kiểm tra trạng thái có giống nhau không và thời gian kết thúc có gần với thời gian bắt đầu của nextInterval không
    if (currentInterval.status === nextInterval.status &&
        (moment(currentInterval.endTime, 'HH:mm').isSameOrAfter(moment(nextInterval.startTime, 'HH:mm')) ||
         moment(currentInterval.endTime, 'HH:mm').isSame(moment(nextInterval.startTime, 'HH:mm')))) {

      // Hợp nhất các khoảng thời gian nếu cùng trạng thái và gần nhau
      currentInterval.endTime = moment.max(
        moment(currentInterval.endTime, 'HH:mm'),
        moment(nextInterval.endTime, 'HH:mm')
      ).format('HH:mm');
    } else {
      // Đẩy interval hiện tại vào danh sách merged và chuyển sang interval tiếp theo
      merged.push(currentInterval);
      currentInterval = nextInterval;
    }
  }

  merged.push(currentInterval);
  return merged;
};

const processAndSaveTelemetryData = async (deviceId, telemetryData) => {
  try {
    const processedData = telemetryData
      .filter(item => item.value === '1' || item.value === '0') // Chỉ xử lý '1' (Chạy) và '0' (Dừng)
      .map((item) => ({
        date: moment(item.ts).format('YYYY-MM-DD'),
        deviceId,
        status: item.value === '1' ? 'Chạy' : 'Dừng',
        startTime: moment(item.ts).format('HH:mm'),
        endTime: moment(item.ts).add(5, 'minutes').format('HH:mm'), // Thêm 5 phút cho thời gian kết thúc
      }));

    const groupedData = _(processedData)
      .groupBy('date')
      .toPairs()
      .sortBy(([date]) => moment(date, 'YYYY-MM-DD'))
      .fromPairs()
      .value();

    const promises = Object.keys(groupedData).map(async (date) => {
      const mergedIntervals = mergeIntervals(groupedData[date]);

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
