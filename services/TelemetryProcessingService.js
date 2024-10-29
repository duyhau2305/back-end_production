// const moment = require('moment');
const moment = require('moment-timezone');

const _ = require('lodash');
const DailyStatus = require('../models/DailyStatus');
const AvailabilityRealtime = require('../models/AvailabilityRealtime');
const AvailabilityHour = require('../models/AvailabilityHour');
const AvailabilityDay = require('../models/AvailabilityDay');
const machineOperations = require('../models/machineOperations');
function convertTimestampToTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}
function convertTimestampToUTCString(timestamp) {
  return moment(timestamp).utc().format('YYYY-MM-DDTHH:mm:ss.SSS[Z]');
}
function generateTimeRangesForNew(data, deviceId) {
  return data.reduce((ranges, entry, i) => {
    if (i === 0) {
      // Initialize the start time and current value for the first entry
      ranges.startTime = entry.ts;
      ranges.currentValue = entry.value;
      return ranges;
    }
    // Check if the value has changed, signaling a new range
    if (entry.value !== ranges.currentValue) {
      const endTime = convertTimestampToUTCString(data[i - 1].ts);
      const durationInSeconds = moment(endTime).diff(moment(ranges.startTime), 'seconds');
      const date = convertTimestampToUTCString(ranges.startTime);
      ranges.output.push({
        deviceId: deviceId,
        startTime: convertTimestampToUTCString(ranges.startTime),
        endTime: endTime,
        status: ranges.currentValue === '1' ? 'Chạy' : 'Dừng',
        durationInMinutes: durationInSeconds,
        date: date
      });
      // Update the start time and current value for the new range
      ranges.startTime = entry.ts;
      ranges.currentValue = entry.value;
    }
    // Handle the last entry in the data array
    if (i === data.length - 1) {
      const endTime = convertTimestampToUTCString(entry.ts);
      const durationInSeconds = moment(endTime).diff(moment(ranges.startTime), 'seconds');
      const date = convertTimestampToUTCString(ranges.startTime);
      ranges.output.push({
        deviceId: deviceId,
        startTime: convertTimestampToUTCString(ranges.startTime),
        endTime: endTime,
        status: ranges.currentValue === '1' ? 'Chạy' : 'Dừng',
        durationInMinutes: durationInSeconds,
        date: date
      });
    }
    return ranges;
  }, { output: [], startTime: null, currentValue: null }).output;
}
function generateTimeRanges(data) {
  const ranges = [];
  let startTime = data[0].ts;
  let currentValue = data[0].value;

  for (let i = 1; i < data.length; i++) {
    if (data[i].value !== currentValue) {
      if (currentValue == '1') {
        ranges.push({
          startTime: startTime,
          endTime: data[i - 1].ts,
          status: 'Chạy'
        });
      } else {
        ranges.push({
          startTime: startTime,
          endTime: data[i - 1].ts,
          status: 'Dừng'
        });
      }

      // Cập nhật giá trị mới và thời gian bắt đầu
      startTime = data[i].ts;
      currentValue = data[i].value;
    }
  }
  if (currentValue == '1') {
    ranges.push({
      startTime: startTime,
      endTime: data[data.length - 1].ts,
      status: 'Chạy'
    });
  } else {
    ranges.push({
      startTime: startTime,
      endTime: data[data.length - 1].ts,
      status: 'Dừng'
    });
  }


  return ranges;
}
function convertTimestampToTime(timestamp) {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();
  const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  return formattedTime;
}
function calculateTotalDurationByStatus(data) {
  return data.reduce((acc, item) => {
    const { status, durationInMinutes } = item;
    if (!acc[status]) {
      acc[status] = 0;
    }
    acc[status] += durationInMinutes;

    return acc;
  }, {});
}
const addProcessRecordFor15Min = async (deviceId, caculateData) => {
  const data = {
    deviceId: deviceId,
    logTime: moment().toISOString(),
    runtime: caculateData['Chạy'],
    stopTime: caculateData['Dừng'],
  };
  try {
    const newRecord = new AvailabilityRealtime(data);
    await newRecord.save();
    console.log('Record added successfully:', newRecord);
  } catch (error) {
    console.error('Error adding record:', error);
  }
}
const addProcessRecordFor1Hour = async (deviceId, caculateData) => {
  console.log(caculateData)
  const logTime = moment().startOf('hour').toISOString();
  const nextHour = moment(logTime).add(1, 'hour').toISOString();
  const data = {
    deviceId: deviceId,
    logTime: logTime,
    runtime: caculateData['Chạy'],
    stopTime: caculateData['Dừng'],
  };
  try {
    const existingRecord = await AvailabilityHour.findOne({
      logTime: {
        $gte: logTime,
        $lt: nextHour,
      },
    });
    if (existingRecord) {
      existingRecord.runtime += data.runtime;
      existingRecord.stopTime += data.stopTime;
      await existingRecord.save();
      console.log('Record updated successfully:', existingRecord);
    } else {
      const newRecord = new AvailabilityHour(data);
      await newRecord.save();
      console.log('Record added successfully:', newRecord);
    }
  } catch (error) {
    console.error('Error adding/updating record:', error);
  }
}
const addProcessRecordFor1Day = async (deviceId, caculateData) => {
  const logTime = moment().startOf('day').toISOString();
  const endOfDay = moment(logTime).endOf('day').toISOString();
  const data = {
    deviceId: deviceId,
    logTime: logTime,
    runtime: caculateData['Chạy'],
    stopTime: caculateData['Dừng'],
  };
  try {
    const existingRecord = await AvailabilityDay.findOne({
      logTime: {
        $gte: logTime,
        $lt: endOfDay,
      },
    });
    if (existingRecord) {
      existingRecord.runtime += data.runtime;
      existingRecord.stopTime += data.stopTime;
      await existingRecord.save();
      console.log('Record updated successfully:', existingRecord);
    } else {
      const newRecord = new AvailabilityDay(data);
      await newRecord.save();
      console.log('Record added successfully:', newRecord);
    }
  } catch (error) {
    console.error('Error adding/updating record:', error);
  }
}
const addAllProcessRecords = async (deviceId, caculateData) => {
  try {
    await Promise.all([
      addProcessRecordFor15Min(deviceId, caculateData),
      addProcessRecordFor1Hour(deviceId, caculateData),
      addProcessRecordFor1Day(deviceId, caculateData),
    ]);
    console.log('All records processed successfully.');
  } catch (error) {
    console.error('Error processing all records:', error);
  }
};
const processAndSaveTelemetryData = async (deviceId, telemetryData) => {
  const sortedDataForSave = telemetryData.sort((a, b) => a.ts - b.ts);
  const ResultsforNew = generateTimeRangesForNew(sortedDataForSave, deviceId);
  const totalDurationByStatus = calculateTotalDurationByStatus(ResultsforNew)
  console.log(totalDurationByStatus)
  await addAllProcessRecords(deviceId, totalDurationByStatus)
  try {
    const existingRecords = await machineOperations.find({
      deviceId: deviceId,
      $or: ResultsforNew.map(r => ({
        startTime: r.startTime,
        endTime: r.endTime
      }))
    }).select('startTime endTime');
    const existingRecordsSet = new Set(
      existingRecords.map(record => record.startTime + record.endTime)
    );
    const newRecords = ResultsforNew.filter(
      r => !existingRecordsSet.has(r.startTime + r.endTime)
    );
    if (newRecords.length > 0) {
      const savedOperations = await machineOperations.insertMany(newRecords);
      console.log('Thêm thành công các bản ghi:', savedOperations);
    } else {
      console.log('Không có bản ghi mới nào để thêm.');
    }
  } catch (error) {
    console.error('Lỗi khi thêm bản ghi:', error);
  }

};


module.exports = {
  processAndSaveTelemetryData,
};
