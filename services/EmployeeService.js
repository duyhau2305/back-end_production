// services/EmployeeService.js
const Employee = require('../models/Employee');

async function getAllEmployees() {
  return await Employee.find();
}

async function getEmployeeById(id) {
  return await Employee.findById(id);
}

async function createEmployee(data) {
  const newEmployee = new Employee(data);
  return await newEmployee.save();
}

async function updateEmployee(id, data) {
  return await Employee.findByIdAndUpdate(id, data, { new: true });
}

async function deleteEmployee(id) {
  return await Employee.findByIdAndDelete(id);
}

module.exports = {
  getAllEmployees,
  getEmployeeById,
  createEmployee,
  updateEmployee,
  deleteEmployee,
};
