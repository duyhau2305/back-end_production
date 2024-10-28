const { response } = require('express');
const cron = require('node-cron');

const DailyStatus = require('../models/DailyStatus');
const WorkShift = require('../models/WorkShift');
const WorkshiftsR = require('../models/WorkshiftsR');
const { getTelemetryDataFromMongoDB } = require('../services/DailyStatusService');
const moment = require('moment');
const { default: axios } = require('axios');
const https = require('https'); // Yêu cầu module https
const AvailabilityDay = require('../models/AvailabilityDay');
const ProductionTask = require('../models/ProductionTask');
const machineOperations = require('../models/machineOperations');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"

const agent = new https.Agent({

  rejectUnauthorized: false

});
const calculateTotalOfflinePercentageBefore23 = (gaps, type) => {
  const totalSecondsInDay = 24 * 60 * 60;
  const limitTime = moment('23:00', 'HH:mm').hours() * 3600;
  let totalOfflineTime
  if (type == 'offline') {
    totalOfflineTime = gaps.reduce((acc, gap) => {
      let startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
      let endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
      if (endSeconds > limitTime) {
        endSeconds = limitTime;
      }
      if (endSeconds > startSeconds) {
        const offlineDuration = endSeconds - startSeconds;
        acc += offlineDuration;
      }

      return acc;
    }, 0);
  } else {
    totalOfflineTime = gaps.reduce((acc, gap) => {
      let startSeconds
      let endSeconds
      if (gap.status == type) {
        startSeconds = moment(gap.startTime, 'HH:mm').hours() * 3600 + moment(gap.startTime, 'HH:mm').minutes() * 60;
        endSeconds = moment(gap.endTime, 'HH:mm').hours() * 3600 + moment(gap.endTime, 'HH:mm').minutes() * 60;
      }
      if (endSeconds > limitTime) {
        endSeconds = limitTime; // Chỉ tính đến 23:00
      }
      if (endSeconds > startSeconds) {
        const offlineDuration = endSeconds - startSeconds;
        acc += offlineDuration;
      }
      return acc;
    }, 0);
  }

  const totalOfflinePercentage = (totalOfflineTime / totalSecondsInDay) * 100;
  return totalOfflinePercentage.toFixed(2);
};
const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};
const formatTime = (minutes) => {
  const hours = String(Math.floor(minutes / 60)).padStart(2, '0');
  const mins = String(minutes % 60).padStart(2, '0');
  return `${hours}:${mins}`;
};
const findGaps = (intervals) => {
  const sortedIntervals = intervals.map(item => ({
    start: timeToMinutes(item.startTime),
    end: timeToMinutes(item.endTime),
  })).sort((a, b) => a.start - b.start);

  const gaps = [];
  const dayStart = 0;
  const dayEnd = 24 * 60;
  let lastEnd = dayStart;

  sortedIntervals.forEach(({ start, end }) => {
    if (start > lastEnd) {
      gaps.push({
        status: 'offline',
        startTime: formatTime(lastEnd),
        endTime: formatTime(start),
      });
    }
    lastEnd = Math.max(lastEnd, end);
  });

  if (lastEnd < dayEnd) {
    gaps.push({
      status: 'offline',
      startTime: formatTime(lastEnd),
      endTime: formatTime(dayEnd),
    });
  }
  return gaps;
};
const calculateTotalTime = (data) => {
  let totalRunTime = 0;
  let totalStopTime = 0;

  data.forEach(entry => {
      const startMinutes = timeToMinutes(entry.startTime);
      const endMinutes = timeToMinutes(entry.endTime);
      const duration = endMinutes - startMinutes;

      if (entry.status === "Chạy") {
          totalRunTime += duration;
      } else if (entry.status === "Dừng") {
          totalStopTime += duration;
      }
  });

  return {
      totalRunTime,
      totalStopTime
  };
};

const getDataTotalDeviceStatus = async (req , res) => {
  const { deviceId, startDate } = req.query;
  const getAllWorkshift = await WorkshiftsR.find({ shiftCode: "CaChinh"})
  console.log(getAllWorkshift)
  const dailyStatus = await DailyStatus.findOne({ date: startDate , deviceId: deviceId });
  const gaps = findGaps(dailyStatus.intervals);
  console.log(gaps)
  const OfflinePercent = calculateTotalOfflinePercentageBefore23(gaps, 'offline');
  const runPercent = calculateTotalOfflinePercentageBefore23(dailyStatus.intervals, 'Chạy');
  const StopPercent = calculateTotalOfflinePercentageBefore23(dailyStatus.intervals, 'Dừng');
  const totalTime = calculateTotalTime(dailyStatus.intervals);
  console.log(totalTime)
  const PercentArray = [{run : runPercent , stop : StopPercent , off : OfflinePercent , totalRunTime : `${Math.floor(totalTime.totalRunTime / 60)} giờ ${totalTime.totalRunTime % 60} phút`, totalStopTime : `${Math.floor(totalTime.totalStopTime / 60)} giờ ${totalTime.totalStopTime % 60} phút` }]
  console.log(runPercent)
  return res.status(200).json(PercentArray);
}
const getTelemetryData = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;
  try {
   
    const data = await getTelemetryDataFromMongoDB(deviceId, startDate, endDate);
   
    res.status(200).json(data);
  } catch (error) {
    
    res.status(404).json({ error: error.message });
  }
};

const getDataWithSessionID = async (sessionID) => {
  console.log(sessionID)
  try {
    const response = await axios.put('https://192.168.1.13/data/tags/T8:Status',         {
      "value" : "1"
    },
      {
        headers: {
          'Referer': 'https://127.0.0.1/',
          'Content-Type': 'application/json',
          'Cookie': `SID=${sessionID}`  
        },
      }
    );
    console.log('Data:', response.data);
  } catch (error) {
    console.error('Error fetching data:', error);
  }
};
const loginApi=async()=>{
  try {
    const response = await axios.put('https://192.168.1.13/sys/log_in',{
      password : "00000000"
    } ,{
      headers: {
        'Referer': 'https://127.0.0.1/',
        'Content-Type': 'application/json'
      }
    });
     const sessionID = response.data.session_id || 0;
    await getDataWithSessionID(sessionID);

  } catch (error) {
    console.log("can't")

  }
} 
const updateTask = async (req , res) => {
  cron.schedule('*/15 * * * *', loginApi);

  try {
    const response = await axios.put('https://192.168.1.13/sys/log_in',{
      password : "00000000"
    } ,{
      headers: {
        'Referer': 'https://127.0.0.1/',
        'Content-Type': 'application/json'
      }
    });
     const sessionID = response.data.session_id || 0;
    await getDataWithSessionID(sessionID);
    return res.status(200).json({status : 'ok'});

  } catch (error) {
    console.log("can't")
    return res.status(400).json({status : 'bad request'});

  }
  
  
  
}
const getProcessDevice = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;

  // Chuyển startDate và endDate từ chuỗi 'YYYY-MM-DD' sang định dạng UTC
  const start = new Date(`${startDate}T00:00:00.000Z`).toISOString();
  const end = new Date(`${endDate}T23:59:59.999Z`).toISOString();

  try {
    // Lấy dữ liệu từ AvailabilityDay và ProductionTasks đồng thời
    const [availabilityData, productionTasks] = await Promise.all([
      AvailabilityDay.findOne({
        logTime: {
          $gte: start,
          $lte: end
        },
        deviceId: deviceId
      }),
      ProductionTask.aggregate([
        {
          $match: {
            deviceId: deviceId,
          }
        },
        { $unwind: "$shifts" }, // Tách mảng shifts thành các phần tử riêng
        {
          $lookup: {
            from: "workshifts", // Tên của collection bạn muốn join
            localField: "shifts.shiftName", // Trường trong ProductionTasks.shifts
            foreignField: "shiftName", // Trường trong workshifts
            as: "shiftDetails" // Tên trường lưu kết quả join
          }
        },
        { $unwind: "$shiftDetails" }, // Tách mảng shiftDetails nếu cần thiết
        {
          $group: {
            _id: "$_id",
            shifts: { $push: { shift: "$shifts", shiftDetails: "$shiftDetails" } }, // Gom shifts thành mảng
            otherFields: { $first: "$$ROOT" } // Giữ các trường khác từ document gốc
          }
        },
        {
          $replaceRoot: {
            newRoot: {
              $mergeObjects: ["$otherFields", { shifts: "$shifts" }] // Thay thế root để giữ các trường khác và shifts đã join
            }
          }
        }
      ])
    ]);

    // Trả về cả hai bộ dữ liệu trong response
    res.status(200).json({ availabilityData, productionTasks });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};
const getMachineOperations = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;

  try {
    // Kiểm tra deviceId, startDate, và endDate hợp lệ
    if (!deviceId || !Date.parse(startDate) || !Date.parse(endDate)) {
      return res.status(400).json({ message: 'Invalid parameters' });
    }

    // Tìm kiếm các bản ghi trong khoảng thời gian đã cung cấp
    const operations = await machineOperations.find({
      deviceId: deviceId,
      startTime: { $gte: startDate, $lte: endDate },
      endTime: { $gte: startDate, $lte: endDate }
    });

    // Nhóm kết quả theo ngày
    const result = operations.reduce((acc, operation) => {
      const date = operation.startTime.split('T')[0]; // Lấy ngày từ startTime

      // Kiểm tra xem đã có ngày này trong acc chưa
      if (!acc[date]) {
        acc[date] = { deviceId, date, intervals: [] };
      }

      // Thêm interval vào mảng intervals
      acc[date].intervals.push({
        startTime: operation.startTime,
        endTime: operation.endTime,
        status: operation.status
      });

      return acc;
    }, {});

    // Chuyển đổi object thành mảng
    const finalResult = Object.values(result);
    console.log(finalResult);
    return res.status(200).json(finalResult);
  } catch (error) {
    console.error('Error fetching machine operations:', error);
    return res.status(500).json({ message: 'Server error' });
  }
};





module.exports = {
  getTelemetryData,
  getDataTotalDeviceStatus,
  updateTask,
  getProcessDevice,
  getMachineOperations
};