const Employee = require('../models/Employee'); 
const Area = require('../models/Area'); // 


async function createEmployee(req, res) {
  const { areaName } = req.body;

  try {
    
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

 
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function updateEmployee(req, res) {
  const { areaName } = req.body;

  try {
    
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


async function deleteEmployee(req, res) {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa nhân viên thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


async function getEmployeeById(req, res) {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}


async function getAllEmployees(req, res) {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createEmployee,
  updateEmployee,
  deleteEmployee,
  getEmployeeById,
  getAllEmployees,
};
