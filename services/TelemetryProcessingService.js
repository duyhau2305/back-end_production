// const moment = require('moment');
const moment = require('moment-timezone');

const _ = require('lodash');
const DailyStatus = require('../models/DailyStatus');
const AvailabilityRealtime = require('../models/AvailabilityRealtime');
const AvailabilityHour = require('../models/AvailabilityHour');
const AvailabilityDay = require('../models/AvailabilityDay');




function convertTimestampToTime(timestamp) {
  const date = new Date(timestamp);
  return date.toLocaleTimeString();
}
function generateTimeRanges(data) {
  const ranges = [];
  let startTime = data[0].ts;
  let currentValue = data[0].value;

  for (let i = 1; i < data.length; i++) {
      if (data[i].value !== currentValue) {
        if(currentValue == '1'){
          ranges.push({
            startTime: startTime,
            endTime: data[i - 1].ts,
            status: 'Chạy'
        });
        }else{
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
  if(currentValue == '1'){
    ranges.push({
      startTime: startTime,
      endTime: data[data.length - 1].ts,
      status: 'Chạy'
  });
  }else{
    ranges.push({
      startTime: startTime,
      endTime: data[data.length - 1].ts,
      status: 'Dừng'
  });
  }
  

  return ranges;
}
function convertToSeconds(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  return hours * 3600 + minutes * 60 + seconds;
}

function calculateTotalSecondsForValueInRange(data, type, rangeInSeconds) {
  let totalSeconds = 0;
  const now = new Date();
  const nowInSeconds = convertToSeconds(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
  const startRangeInSeconds = nowInSeconds - rangeInSeconds;
  data.forEach(interval => {
    if (interval.status === type) {
      const startTimeInSeconds = convertToSeconds(interval.startTime);
      const endTimeInSeconds = convertToSeconds(interval.endTime);
      if (endTimeInSeconds >= startRangeInSeconds && startTimeInSeconds <= nowInSeconds) {
        const validStartTime = Math.max(startTimeInSeconds, startRangeInSeconds);
        const validEndTime = Math.min(endTimeInSeconds, nowInSeconds);
        totalSeconds += Math.abs(validEndTime - validStartTime);
      }
      if (startTimeInSeconds == endTimeInSeconds) {
        totalSeconds += 1
      }
    }
  });
  
  return totalSeconds;
}

function calculateFor15Minutes(data) {
  const fifteenMinutesInSeconds = 15 * 60;
  const now = new Date();
  const nowInSeconds = convertToSeconds(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);

  const totalSeconds15MinRunning = calculateTotalSecondsForValueInRange(data, 'Chạy', fifteenMinutesInSeconds, nowInSeconds, nowInSeconds - fifteenMinutesInSeconds);
  const percentage15MinRunning = (totalSeconds15MinRunning / fifteenMinutesInSeconds) * 100;

  const totalSeconds15MinStopped = calculateTotalSecondsForValueInRange(data, 'Dừng', fifteenMinutesInSeconds, nowInSeconds, nowInSeconds - fifteenMinutesInSeconds);
  const percentage15MinStopped = (totalSeconds15MinStopped / fifteenMinutesInSeconds) * 100;

  return {
    Running: {
      totalSeconds: totalSeconds15MinRunning,
      percentage: percentage15MinRunning.toFixed(2) + '%'
    },
    Stopped: {
      totalSeconds: totalSeconds15MinStopped,
      percentage: percentage15MinStopped.toFixed(2) + '%'
    }
  };
}
function calculateFor1Hour(data) {
  const now = new Date();
  
  const startOfCurrentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
  const startOfPreviousHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours() - 1, 0, 0, 0);
  const startOfPreviousHourInSeconds = convertToSeconds(`${startOfPreviousHour.getHours()}:00:00`);
  const startOfCurrentHourInSeconds = convertToSeconds(`${startOfCurrentHour.getHours()}:00:00`);
  const oneHourInSeconds = 3600;
  const totalSeconds1HourRunning = calculateTotalSecondsForValueInRange(data, 'Chạy', oneHourInSeconds, startOfCurrentHourInSeconds, startOfPreviousHourInSeconds);
  const percentage1HourRunning = (totalSeconds1HourRunning / oneHourInSeconds) * 100;
  
  const totalSeconds1HourStopped = calculateTotalSecondsForValueInRange(data, 'Dừng', oneHourInSeconds, startOfCurrentHourInSeconds, startOfPreviousHourInSeconds);
  const percentage1HourStopped = (totalSeconds1HourStopped / oneHourInSeconds) * 100;

  return {
    Running: {
      totalSeconds: totalSeconds1HourRunning,
      percentage: percentage1HourRunning.toFixed(2) + '%'
    },
    Stopped: {
      totalSeconds: totalSeconds1HourStopped,
      percentage: percentage1HourStopped.toFixed(2) + '%'
    }
  };
}

function calculateFor1Day(data) {
  const now = new Date();
  const hour = now.getHours();
  const oneDayInSeconds = hour * 60 * 60;
  const nowInSeconds = convertToSeconds(`${now.getHours()}:${now.getMinutes()}:${now.getSeconds()}`);
  const startRangeInSeconds = 0; // Đối với cả ngày

  const totalSeconds1DayRunning = calculateTotalSecondsForValueInRange(data, 'Chạy', oneDayInSeconds, nowInSeconds, startRangeInSeconds);
  const percentage1DayRunning = (totalSeconds1DayRunning / oneDayInSeconds) * 100;

  const totalSeconds1DayStopped = calculateTotalSecondsForValueInRange(data, 'Dừng', oneDayInSeconds, nowInSeconds, startRangeInSeconds);
  const percentage1DayStopped = (totalSeconds1DayStopped / oneDayInSeconds) * 100;

  return {
    Running: {
      totalSeconds: totalSeconds1DayRunning,
      percentage: percentage1DayRunning.toFixed(2) + '%'
    },
    Stopped: {
      totalSeconds: totalSeconds1DayStopped,
      percentage: percentage1DayStopped.toFixed(2) + '%'
    }
  };
}
function convertTimestampToTime(timestamp) {
  const date = new Date(timestamp);
    const hours = date.getHours(); // Lấy giờ theo định dạng 24 giờ
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    // Định dạng giờ thành dạng HHhMMmSSs
    const formattedTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    return formattedTime;
}
const updateAvailable15Min = async (data) => {
  console.log(data)
  try {
    let new15;
    const currentTime = new Date();
    const fifteenMinutesAgo = new Date(currentTime.getTime() - 15 * 60 * 1000); // Tính toán thời điểm 15 phút trước

    const ProcessIn15 = await AvailabilityRealtime.findOne({
      logTime: {
        $gt: fifteenMinutesAgo, 
        $lt: currentTime 
      }
    });

    if (ProcessIn15) {
      ProcessIn15.set(data); 
      await ProcessIn15.save();
    } else {
      new15 = new AvailabilityRealtime(data); 
      await new15.save(); 
    }

    return ProcessIn15 || new15;
  } catch (error) {
    console.error('Error fetching ProcessIn15:', error.message);
    throw error; 
  }
};
const updateAvalibleHour = async (data) =>{
  const currentTime = new Date();
  const minutesNow = currentTime.getMinutes();

  const HourAgo = new Date(currentTime.getTime() - minutesNow* 60 * 1000 - 60 * 60 * 1000 ); 
  console.log(HourAgo)

  try {
    let new15;
    
    const ProcessIn15 = await AvailabilityHour.findOne({
      logTime: {
        $gt: HourAgo, 
        $lt: currentTime 
      }
    });

    if (ProcessIn15) {
      ProcessIn15.set(data);
      await ProcessIn15.save();
    } else {
      new15 = new AvailabilityHour(data);
      await new15.save(); 
    }

    return ProcessIn15 || new15; // Trả về tài liệu đã cập nhật hoặc tài liệu mới
  } catch (error) {
    console.error('Error fetching ProcessIn15:', error.message);
    throw error; 
  }
}
const updateAvalibleDay = async (data) =>{
  try {
    let new15;
    const currentTime = new Date();
    const startOfToday = new Date(currentTime.getFullYear(), currentTime.getMonth(), currentTime.getDate());

    const ProcessIn15 = await AvailabilityDay.findOne({
      logTime: {
        $gt: startOfToday, 
        $lt: currentTime 
      }
    });

    if (ProcessIn15) {
      ProcessIn15.set(data);
      await ProcessIn15.save();
    } else {
      new15 = new AvailabilityDay(data);
      await new15.save(); 
    }

    return ProcessIn15 || new15; // Trả về tài liệu đã cập nhật hoặc tài liệu mới
  } catch (error) {
    console.error('Error fetching ProcessIn15:', error.message);
    throw error; 
  }

}
const processAndSaveTelemetryData = async (deviceId, telemetryData , type) => {
  const sortedData = telemetryData.sort((a, b) => a.ts - b.ts);

    const date = moment(sortedData[0].ts).format('YYYY-MM-DD')
    sortedData.forEach(item => {
    item.ts = convertTimestampToTime(item.ts);
    });
    const result = generateTimeRanges(sortedData);
    console.log(result)
    let jsonData;
    switch (type) {
      case '15min':
        const processData = JSON.stringify(calculateFor15Minutes(result), null, 2)
        jsonData = JSON.parse(processData)
        break;
      case '1h' :
        const processData1h = JSON.stringify(calculateFor1Hour(result), null, 2)
        jsonData = JSON.parse(processData1h)
        break;
      case 'day' :
        const processData1d = JSON.stringify(calculateFor1Day(result), null, 2)
        jsonData = JSON.parse(processData1d)
        break;
      default:
        break;
    } 
    console.log(jsonData)
    const data = {
      deviceId : deviceId , 
      logTime : new Date(),
      runtime : jsonData.Running.totalSeconds,
      stopTime: jsonData.Stopped.totalSeconds,
      date :new Date().toDateString()
    }
    console.log(type)
    switch (type) {
      case '15min':
        updateAvailable15Min(data)
        break;
      case '1h' :
        updateAvalibleHour(data)
        break;
      case 'day' :
        updateAvalibleDay(data)
        break;
      default:
        break;
    }  
  if(type == 'day'){
    try { 
      const existingRecord = await DailyStatus.findOne({ deviceId, date });
      if (existingRecord) {
        existingRecord.intervals = result;
        await existingRecord.save();
      } else {
        const newDailyStatus = new DailyStatus({
          deviceId,
          date,
          intervals: result,
        });
        await newDailyStatus.save();
      }
    
  } catch (error) {
    console.error('Error processing and saving telemetry data:', error);
    throw new Error('Error saving telemetry data');
  }
  }
};
module.exports = {
  processAndSaveTelemetryData,
};
