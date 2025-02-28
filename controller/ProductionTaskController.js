const Shift = require('../models/WorkShift');
const Employee = require('../models/Employee');
const Device = require('../models/Device');
const productionTaskService = require('../services/ProductionTaskService');
const moment = require('moment-timezone');

async function createProductionTask(req, res) {
  const { shifts, deviceName, deviceId, date } = req.body;

  try {
    // Kiểm tra thiết bị
    const existingDevice = await Device.findOne({ deviceId });
    if (!existingDevice) {
      return res.status(400).json({ message: `Thiết bị với ID ${deviceId} không tồn tại.` });
    }

    // Kiểm tra nếu nhiệm vụ đã tồn tại cho cùng thiết bị và ngày
    const existingTask = await productionTaskService.findTaskByDeviceAndDate(deviceId, date);
    if (existingTask) {
      return res.status(400).json({ message: 'Nhiệm vụ sản xuất đã tồn tại cho thiết bị và ngày này.' });
    }

    // Kiểm tra và xử lý ca làm việc và nhân viên
    const { validShifts, shiftErrors } = await validateShifts(shifts);
    if (shiftErrors.length > 0) {
      return res.status(400).json({ message: shiftErrors.join(', ') });
    }

    // Tạo dữ liệu nhiệm vụ sản xuất
    const productionTaskData = { date, deviceName, deviceId, shifts: validShifts };

    // Lưu nhiệm vụ sản xuất
    const productionTask = await productionTaskService.createProductionTask(productionTaskData);
    res.status(201).json(productionTask);
  } catch (err) {
    res.status(500).json({ message: `Lỗi hệ thống: ${err.message}` });
  }
}

async function updateProductionTask(req, res) {
  const { shifts, deviceName, deviceId, date } = req.body;

  try {
    // Kiểm tra thiết bị
    const existingDevice = await Device.findOne({ deviceId });
    if (!existingDevice) {
      return res.status(400).json({ message: `Thiết bị với ID ${deviceId} không tồn tại.` });
    }

    // Kiểm tra nhiệm vụ sản xuất tồn tại
    const existingTask = await productionTaskService.getProductionTaskById(req.params.id);
    if (!existingTask) {
      return res.status(404).json({ message: 'Nhiệm vụ sản xuất không tồn tại.' });
    }

    // Kiểm tra và xử lý ca làm việc và nhân viên
    const { validShifts, shiftErrors } = await validateShifts(shifts);
    if (shiftErrors.length > 0) {
      return res.status(400).json({ message: shiftErrors.join(', ') });
    }

    // Dữ liệu cập nhật
    const productionTaskData = { date, deviceName, deviceId, shifts: validShifts };

    // Cập nhật nhiệm vụ sản xuất
    const updatedTask = await productionTaskService.updateProductionTask(req.params.id, productionTaskData);
    res.status(200).json(updatedTask);
  } catch (err) {
    res.status(500).json({ message: `Lỗi hệ thống: ${err.message}` });
  }
}

// Hàm validate ca làm việc và nhân viên
async function validateShifts(shifts) {
  const shiftErrors = [];
  const validShifts = await Promise.all(
    shifts.map(async (shift) => {
      const existingShift = await Shift.findOne({ shiftName: new RegExp(`^${shift.shiftName}$`, 'i') });
      if (!existingShift) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} không tồn tại.`);
      }

      const employeeErrors = [];
      await Promise.all(
        shift.employeeName.map(async (name) => {
          const existingEmployee = await Employee.findOne({ employeeName: new RegExp(`^${name}$`, 'i') });
          if (!existingEmployee) {
            employeeErrors.push(`Nhân viên ${name} không tồn tại.`);
          }
        })
      );

      if (employeeErrors.length > 0) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} có lỗi: ${employeeErrors.join(', ')}`);
      }

      return { shiftName: shift.shiftName, status: shift.status, employeeName: shift.employeeName };
    })
  );

  return { validShifts, shiftErrors };
}


async function deleteProductionTask(req, res) {
  try {
    const productionTask = await productionTaskService.deleteProductionTask(req.params.id);
    if (!productionTask) {
      return res.status(404).json({ message: 'Nhiệm vụ sản xuất không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa nhiệm vụ sản xuất thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAllProductionTasks(req, res) {
  const { deviceId, startTime, endTime, startDate, endDate } = req.query;
  try {
    const filter = {};

    // Filter by deviceId if provided
    if (deviceId) {
      filter.deviceId = deviceId;
    }

    // Handle filtering by startTime and endTime (time range in Asia/Ho_Chi_Minh)
    if (startTime && endTime) {
      const start = moment.tz(startTime, "Asia/Ho_Chi_Minh").utc().toDate();
      const end = moment.tz(endTime, "Asia/Ho_Chi_Minh").utc().toDate();
      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    // Handle filtering by startDate and endDate (dates in Asia/Ho_Chi_Minh)
    if (startDate && endDate) {
      const start = moment.tz(startDate, "Asia/Ho_Chi_Minh").startOf("day").utc().toDate();
      const end = moment.tz(endDate, "Asia/Ho_Chi_Minh").endOf("day").utc().toDate();
      filter.date = {
        $gte: start,
        $lte: end,
      };
    }

    console.log("Filter applied:", filter); // Log to debug the applied filter

    // Query the production tasks based on the filter
    const productionTasks = await productionTaskService.getAllProductionTasks(filter);

    res.status(200).json(productionTasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
}




async function getProductionTaskById(req, res) {
  try {
    const productionTask = await productionTaskService.getProductionTaskById(req.params.id);
    if (!productionTask) {
      return res.status(404).json({ message: 'Nhiệm vụ sản xuất không tồn tại' });
    }
    res.status(200).json(productionTask);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createProductionTask,
  updateProductionTask,
  deleteProductionTask,
  getAllProductionTasks,
  getProductionTaskById,
};
