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

  
    if (currentInterval.status === nextInterval.status &&
        moment(currentInterval.endTime, 'HH:mm').isSameOrAfter(moment(nextInterval.startTime, 'HH:mm'))) {
      
      currentInterval.endTime = moment.max(
        moment(currentInterval.endTime, 'HH:mm'),
        moment(nextInterval.endTime, 'HH:mm')
      ).format('HH:mm');
    } else {
      
      if (moment(currentInterval.endTime, 'HH:mm').isAfter(moment(nextInterval.startTime, 'HH:mm'))) {
       
        const overlapEnd = moment(nextInterval.startTime, 'HH:mm').format('HH:mm');

      
        const currentIntervalBeforeOverlap = {
          ...currentInterval,
          endTime: overlapEnd,
        };
        merged.push(currentIntervalBeforeOverlap);

       
        currentInterval.startTime = overlapEnd;
      }

      merged.push(currentInterval);
      currentInterval = nextInterval;
    }
  }

 
  merged.push(currentInterval);

  return merged;
};

// save MongoDB
const processAndSaveTelemetryData = async (deviceId, telemetryData) => {
  try {
    const processedData = telemetryData.map((item) => ({
      date: moment(item.ts).format('YYYY-MM-DD'),
      deviceId,
      status: item.value === '1' ? 'Chạy' : 'Dừng',
      startTime: moment(item.ts).format('HH:mm'),
      endTime: moment(item.ts + 300000).format('HH:mm'),
    }));

    const groupedData = _.groupBy(processedData, 'date');

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
