const Device = require('../models/Device'); // Import your Device model

// Create a device
async function createDevice(deviceData) {
  const device = new Device(deviceData);
  return await device.save();
}

// Get a device by ID
async function getDeviceById(deviceID) { // Make sure the function name matches
  return await Device.findOne({ deviceID });
}

// Update a device
async function updateDevice(id, deviceData) {
  return await Device.findByIdAndUpdate(id, deviceData, { new: true });
}

// Delete a device
async function deleteDevice(id) {
  return await Device.findByIdAndDelete(id);
}

// Get all devices
async function getAllDevices() {
  return await Device.find();
}

module.exports = {
  createDevice,
  getDeviceById, // Make sure the export matches the function name
  updateDevice,
  deleteDevice,
  getAllDevices,
};
