const Area = require('../models/Area'); // Import Area model
const deviceService = require('../services/DeviceService'); // Import Device Service

// Create a device
async function createDevice(req, res) {
  try {
    const { deviceId, deviceName, areaName, model, technicalSpecifications, purchaseDate } = req.body;

    if (!deviceId || !deviceName || !areaName || !model || !purchaseDate || !technicalSpecifications) {
      return res.status(400).json({ message: 'Tất cả các trường bắt buộc phải có.' });
    }

    const trimmedDeviceId = String(deviceId).trim();
    console.log('Trimmed Device ID:', trimmedDeviceId);

    // Kiểm tra xem thiết bị đã tồn tại chưa
    const existingDevice = await deviceService.getDeviceById(trimmedDeviceId);
    console.log('Existing Device:', existingDevice);

    if (existingDevice) {
      return res.status(400).json({ message: `Thiết bị với ID ${trimmedDeviceId} đã tồn tại.` });
    }

    // Tạo thiết bị mới
    const device = await deviceService.createDevice({ ...req.body, deviceId: trimmedDeviceId });
    return res.status(201).json(device);
  } catch (err) {
    console.error('Error creating device:', err);
    return res.status(500).json({ message: 'Lỗi khi thêm thiết bị.', error: err.message });
  }
}


// Update a device
async function updateDevice(req, res) {
  try {
    const { id } = req.params;
    const updatedDevice = await deviceService.updateDevice(id, req.body);

    if (!updatedDevice) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại.' });
    }

    return res.status(200).json(updatedDevice);
  } catch (err) {
    console.error('Error updating device:', err);
    return res.status(500).json({ message: 'Lỗi khi cập nhật thiết bị.', error: err.message });
  }
}

// Delete a device
async function deleteDevice(req, res) {
  try {
    const { id } = req.params;
    const deletedDevice = await deviceService.deleteDevice(id);

    if (!deletedDevice) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại.' });
    }

    return res.status(200).json({ message: 'Xóa thiết bị thành công.' });
  } catch (err) {
    console.error('Error deleting device:', err);
    return res.status(500).json({ message: 'Lỗi khi xóa thiết bị.', error: err.message });
  }
}

// Get a device by ID
async function getDeviceById(req, res) {
  try {
    const { id } = req.params;

    // Kiểm tra xem ID có hợp lệ không
    if (!id) {
      return res.status(400).json({ message: 'ID thiết bị không hợp lệ.' });
    }

    const device = await deviceService.getDeviceById(id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại.' });
    }

    return res.status(200).json(device);
  } catch (err) {
    console.error('Error fetching device by ID:', err);
    return res.status(500).json({ message: 'Lỗi khi lấy thiết bị.', error: err.message });
  }
}

// Get all devices
async function getAllDevices(req, res) {
  try {
    const devices = await deviceService.getAllDevices();
    return res.status(200).json(devices);
  } catch (err) {
    console.error('Error fetching all devices:', err);
    return res.status(500).json({ message: 'Lỗi khi lấy danh sách thiết bị.', error: err.message });
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
