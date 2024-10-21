const Device = require('../models/Device'); // Import your Device model

// Create a device
async function createDevice(deviceData) {
  // Không cần kiểm tra deviceCode nữa
  const device = new Device(deviceData);
  return await device.save();
}


// Get a device by deviceId
async function getDeviceById(deviceId) {
  return await Device.findOne({ deviceId }); // Use findOne to get the matching device
}

// Update a device by ID
async function updateDevice(id, deviceData) {
  return await Device.findByIdAndUpdate(id, deviceData, { new: true });
}

// Delete a device by ID
async function deleteDevice(id) {
  return await Device.findByIdAndDelete(id);
}

// Get all devices
async function getAllDevices() {
  return await Device.find();
}

// Export the functions
module.exports = {
  createDevice,
  getDeviceById,
  updateDevice,
  deleteDevice,
  getAllDevices,
};
