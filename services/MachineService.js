// services/MachineSummaryService.js
const Device = require('../models/Device');
const DailyStatus = require('../models/DailyStatus');
const ProductionTask = require('../models/ProductionTask');
const WorkShift = require('../models/WorkShift'); // Import model WorkShift
const moment = require('moment');

const getMachineDetails = async (deviceId) => {
  const today = moment().format('YYYY-MM-DD');

  try {
    // Lấy thông tin thiết bị từ Device
    const deviceData = await Device.findOne({ deviceId });

    if (!deviceData) {
      throw new Error('Không tìm thấy thiết bị');
    }

    // Lấy thông tin trạng thái hàng ngày từ DailyStatus
    const dailyStatusData = await DailyStatus.findOne({ deviceId, date: today });

    // Lấy thông tin nhiệm vụ sản xuất từ ProductionTask dựa trên deviceId và ngày
    const productionTaskData = await ProductionTask.findOne({ deviceId, date: today });

    // Nếu không có dữ liệu từ DailyStatus hoặc ProductionTask, trả về giá trị mặc định
    const status = dailyStatusData ? dailyStatusData.intervals[dailyStatusData.intervals.length - 1].status : 'Không xác định';
    const elapsedTime = dailyStatusData ? calculateElapsedTime(dailyStatusData.intervals) : '0 phút';

    // Lấy thông tin ca làm việc đầu tiên nếu có trong ProductionTask
    const shiftData = productionTaskData ? productionTaskData.shifts[0] : {};
    const shiftName = shiftData ? shiftData.shiftName : 'Không xác định';
    const employee = shiftData ? shiftData.employeeName : 'Không có dữ liệu';
    const signalLight = shiftData ? shiftData.status : 'Không xác định';

    // Lấy startTime và endTime từ WorkShift dựa trên shiftName
    const workShiftData = shiftName !== 'Không xác định' ? await WorkShift.findOne({ shiftName }) : null;
    const startTime = workShiftData ? workShiftData.startTime : 'Chưa xác định';
    const endTime = workShiftData ? workShiftData.endTime : 'Chưa xác định';

    // Trả về dữ liệu tổng hợp với các giá trị từ các collection khác nhau
    return {
      id: deviceData.deviceId,
      deviceName: deviceData.deviceName,
      areaName: deviceData.areaName || 'Không xác định',
      model: deviceData.model,
      technicalSpecifications: deviceData.technicalSpecifications,
      formattedPurchaseDate: deviceData.formattedPurchaseDate,
      status,
      elapsedTime,
      employee,
      shiftName,
      startTime,  // startTime từ workShiftData
      endTime,    // endTime từ workShiftData
      signalLight,
    };
  } catch (error) {
    console.error('Lỗi khi lấy dữ liệu từ các collection:', error);
    
  }
};

// Hàm tính toán thời gian hoạt động dựa trên các khoảng thời gian
const calculateElapsedTime = (intervals) => {
  let totalMinutes = 0;
  intervals.forEach(interval => {
    const start = moment(interval.startTime, 'HH:mm');
    const end = moment(interval.endTime, 'HH:mm');
    totalMinutes += end.diff(start, 'minutes');
  });
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours} giờ ${minutes} phút`;
};

module.exports = {
  getMachineDetails
};
