const Employee = require('../models/Employee'); // Import model Employee
const Area = require('../models/Area'); // Import model Area

// Tạo mới Employee
async function createEmployee(req, res) {
  const { areaName } = req.body;

  try {
    // Kiểm tra khu vực có tồn tại hay không (không phân biệt chữ hoa chữ thường)
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    // Nếu khu vực tồn tại, tạo Employee mới
    const employee = new Employee(req.body);
    await employee.save();
    res.status(201).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Cập nhật thông tin Employee
async function updateEmployee(req, res) {
  const { areaName } = req.body;

  try {
    // Kiểm tra khu vực có tồn tại hay không trước khi cập nhật
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    // Tiến hành cập nhật Employee
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }

    res.status(200).json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Xóa Employee
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

// Lấy Employee theo ID
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

// Lấy danh sách tất cả Employee
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
