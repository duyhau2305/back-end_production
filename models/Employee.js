// models/Employee.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema({
  employeeCode: {
    type: String,
    required: [true, 'Mã Nhân Viên là bắt buộc'],
    unique: true, 
  },
  employeeName: {
    type: String,
    required: [true, 'Tên Nhân Viên là bắt buộc'],
  },
  areaName: {
    type: [String],
    required: [true, 'Khu vực là bắt buộc'],
  },
}, { timestamps: true });

module.exports = mongoose.model('Employee', EmployeeSchema);
