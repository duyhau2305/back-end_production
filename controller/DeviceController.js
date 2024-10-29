const Area = require('../models/Area'); // Import Area model
const deviceService = require('../services/DeviceService'); // Import Device Service

// Create a device
async function createDevice(req, res) {
  const { deviceId, deviceName, areaName, model, technicalSpecifications, purchaseDate } = req.body;

  // Kiểm tra các trường bắt buộc
  if (!deviceId || !deviceName || !areaName || !model || !purchaseDate || !technicalSpecifications) {
    return res.status(400).json({ message: 'Tất cả các trường bắt buộc phải có.' });
  }

  // Chuyển deviceId thành chuỗi và trim
  const trimmedDeviceId = typeof deviceId === 'string' ? deviceId.trim() : String(deviceId).trim();

  try {
    console.log('Incoming device data:', req.body);
    console.log('Trimmed Device ID:', trimmedDeviceId);

    // Kiểm tra xem thiết bị đã tồn tại chưa
    const existingDevice = await deviceService.getDeviceById(trimmedDeviceId);
    console.log('Existing Device:', existingDevice);

    if (existingDevice) {
      return res.status(400).json({ message: `Thiết bị với ID ${trimmedDeviceId} đã tồn tại.` });
    }

    // Kiểm tra khu vực tồn tại
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, 'i') });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    // Tạo thiết bị mới
    const device = await deviceService.createDevice({ ...req.body, deviceId: trimmedDeviceId });
    return res.status(201).json(device);
  } catch (err) {
    console.error('Error creating device:', err);

    if (err.code === 11000) {
      return res.status(400).json({ message: `Thiết bị với ID ${trimmedDeviceId} đã tồn tại.` });
    }

    return res.status(500).json({ message: 'Đã xảy ra lỗi khi thêm thiết bị.', error: err.message });
  }
}




// Update a device
async function updateDevice(req, res) {
  const { id } = req.params;

  try {
    const device = await deviceService.updateDevice(id, req.body);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    return res.status(200).json(device);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(400).json({ message: err.message });
  }
}

// Delete a device
async function deleteDevice(req, res) {
  const { id } = req.params;

  try {
    const device = await deviceService.deleteDevice(id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    return res.status(200).json({ message: 'Xóa thiết bị thành công' });
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: err.message });
  }
}

// Get a device by ID
async function getDeviceById(req, res) {
  const { id } = req.params;

  try {
    const device = await deviceService.getDeviceById(id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    return res.status(200).json(device);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: err.message });
  }
}

// Get all devices
async function getAllDevices(req, res) {
  try {
    const devices = await deviceService.getAllDevices();
    return res.status(200).json(devices);
  } catch (err) {
    console.error(err); // Log the error for debugging
    return res.status(500).json({ message: err.message });
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
