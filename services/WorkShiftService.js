// services/WorkShiftService.js
const WorkShift = require('../models/WorkShift');

async function getAllWorkShifts() {
  return await WorkShift.find();
}

async function getWorkShiftById(id) {
  return await WorkShift.findById(id);
}

async function createWorkShift(data) {
  const newShift = new WorkShift(data);
  return await newShift.save();
}

async function updateWorkShift(id, data) {
  return await WorkShift.findByIdAndUpdate(id, data, { new: true });
}

async function deleteWorkShift(id) {
  return await WorkShift.findByIdAndDelete(id);
}

module.exports = {
  getAllWorkShifts,
  getWorkShiftById,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift
};
