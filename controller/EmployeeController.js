// controllers/EmployeeController.js
const employeeService = require('../services/EmployeeService');

async function getAllEmployees(req, res) {
  try {
    const employees = await employeeService.getAllEmployees();
    res.status(200).json(employees);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách nhân viên', error });
  }
}

async function getEmployeeById(req, res) {
  try {
    const employee = await employeeService.getEmployeeById(req.params.id);
    if (!employee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    res.status(200).json(employee);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin nhân viên', error });
  }
}

async function createEmployee(req, res) {
  try {
    const newEmployee = await employeeService.createEmployee(req.body);
    res.status(201).json(newEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo nhân viên mới', error });
  }
}

async function updateEmployee(req, res) {
  try {
    const updatedEmployee = await employeeService.updateEmployee(req.params.id, req.body);
    if (!updatedEmployee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    res.status(200).json(updatedEmployee);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật thông tin nhân viên', error });
  }
}

async function deleteEmployee(req, res) {
  try {
    const deletedEmployee = await employeeService.deleteEmployee(req.params.id);
    if (!deletedEmployee) {
      return res.status(404).json({ message: 'Nhân viên không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa nhân viên thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa nhân viên', error });
  }
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
