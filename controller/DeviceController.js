const Area = require('../models/Area'); // Import Area model
const deviceService = require('../services/DeviceService'); // Import Device Service

// Create a device
async function createDevice(req, res) {
  const { areaName, deviceId } = req.body; // Ensure case matches your request body
  console.log('Request Body:', req.body); // Log the request body for debugging

  // Check if deviceId is provided
  if (!deviceId) {
    return res.status(400).json({ message: 'Thiết bị ID không được để trống.' });
  }

  try {
    // Check if the area exists
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    // Check for existing device by deviceId to avoid duplicates
    const existingDevice = await deviceService.getDeviceById(deviceId);
    if (existingDevice) {
      return res.status(400).json({ message: `Thiết bị với ID ${deviceId} đã tồn tại.` });
    }

    // Create the device
    const device = await deviceService.createDevice(req.body);
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}



// Update a device
async function updateDevice(req, res) {
  const { id } = req.params;

  try {
    // Update the device using the service
    const device = await deviceService.updateDevice(id, req.body);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

// Delete a device
async function deleteDevice(req, res) {
  const { id } = req.params;

  try {
    // Delete the device using the service
    const device = await deviceService.deleteDevice(id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa thiết bị thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get a device by ID
async function getDeviceById(req, res) {
  const { id } = req.params;

  try {
    // Retrieve the device by ID using the service
    const device = await deviceService.getDeviceById(id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Get all devices
async function getAllDevices(req, res) {
  try {
    // Retrieve all devices using the service
    const devices = await deviceService.getAllDevices();
    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// Export the controller functions
module.exports = {
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceById,
  getAllDevices,
};
