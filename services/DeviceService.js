// services/DeviceService.js
const Device = require('../models/Device');

async function createDevice(data) {
  const device = new Device(data);
  return await device.save();
}

async function updateDevice(id, data) {
  return await Device.findByIdAndUpdate(id, data, { new: true });
}

async function deleteDevice(id) {
  return await Device.findByIdAndDelete(id);
}

async function getDeviceById(id) {
  return await Device.findById(id);
}

async function getAllDevices() {
  return await Device.find();
}

module.exports = {
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceById,
  getAllDevices
};
