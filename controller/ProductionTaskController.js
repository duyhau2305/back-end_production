const Shift = require('../models/WorkShift');
const Employee = require('../models/Employee');
const Device = require('../models/Device');
const productionTaskService = require('../services/ProductionTaskService');

async function createProductionTask(req, res) {
  const { shifts, deviceName } = req.body;
  console.log(req.body);

  try {
    
    const existingDevice = await Device.findOne({ deviceName: new RegExp(`^${deviceName}$`, "i") });
    if (!existingDevice) {
      return res.status(400).json({ message: `Thiết bị ${deviceName} không tồn tại. Vui lòng chọn thiết bị hợp lệ.` });
    }

    
    const shiftErrors = [];
    const validShifts = await Promise.all(shifts.map(async (shift) => {
     
      const existingShift = await Shift.findOne({ shiftName: new RegExp(`^${shift.shiftName}$`, "i") });
      if (!existingShift) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} không tồn tại.`);
      }

     
      const employeeErrors = [];
      await Promise.all(shift.employeeName.map(async (name) => {
        const existingEmployee = await Employee.findOne({ employeeName: new RegExp(`^${name}$`, "i") });
        if (!existingEmployee) {
          employeeErrors.push(`Nhân viên ${name} không tồn tại.`);
        }
      }));

      if (employeeErrors.length > 0) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} có lỗi: ${employeeErrors.join(', ')}`);
      }

      return { shiftName: shift.shiftName, status: shift.status, employeeName: shift.employeeName };
    }));

    if (shiftErrors.length > 0) {
      return res.status(400).json({ message: shiftErrors.join(', ') });
    }

    
    const productionTaskData = {
      date: req.body.date,
      deviceName: existingDevice.deviceName,
      shifts: validShifts 
    };

    const productionTask = await productionTaskService.createProductionTask(productionTaskData);
    res.status(201).json(productionTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateProductionTask(req, res) {
  const { shifts, deviceName } = req.body;

  try {
    
    const existingDevice = await Device.findOne({ deviceName: new RegExp(`^${deviceName}$`, "i") });
    if (!existingDevice) {
      return res.status(400).json({ message: `Thiết bị ${deviceName} không tồn tại. Vui lòng chọn thiết bị hợp lệ.` });
    }

    const shiftErrors = [];
    const validShifts = await Promise.all(shifts.map(async (shift) => {
      
      const existingShift = await Shift.findOne({ shiftName: new RegExp(`^${shift.shiftName}$`, "i") });
      if (!existingShift) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} không tồn tại.`);
      }

      
      const employeeErrors = [];
      await Promise.all(shift.employeeName.map(async (name) => {
        const existingEmployee = await Employee.findOne({ employeeName: new RegExp(`^${name}$`, "i") });
        if (!existingEmployee) {
          employeeErrors.push(`Nhân viên ${name} không tồn tại.`);
        }
      }));

      if (employeeErrors.length > 0) {
        shiftErrors.push(`Ca làm việc ${shift.shiftName} có lỗi: ${employeeErrors.join(', ')}`);
      }

      return { shiftName: shift.shiftName, status: shift.status, employeeName: shift.employeeName };
    }));

    if (shiftErrors.length > 0) {
      return res.status(400).json({ message: shiftErrors.join(', ') });
    }

   
    const productionTaskData = {
      date: req.body.date,
      deviceName: existingDevice.deviceName,
      shifts: validShifts 
    };

    const productionTask = await productionTaskService.updateProductionTask(req.params.id, productionTaskData);
    if (!productionTask) {
      return res.status(404).json({ message: 'Nhiệm vụ sản xuất không tồn tại' });
    }

    res.status(200).json(productionTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
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
  try {
    const productionTasks = await productionTaskService.getAllProductionTasks();
    res.status(200).json(productionTasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
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
