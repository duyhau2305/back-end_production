// controllers/deviceController.js
const Area = require('../models/Area'); // Import bảng Area
const deviceService = require('../services/DeviceService');

async function createDevice(req, res) {
  const { areaName } = req.body; 

  try {
    // Kiểm tra khu vực dựa trên areaName được gửi từ frontend
    const existingArea = await Area.findOne({ areaName: new RegExp(`^${areaName}$`, "i") });
    if (!existingArea) {
      return res.status(400).json({ message: `Khu vực ${areaName} không tồn tại. Vui lòng chọn khu vực hợp lệ.` });
    }

    // Tạo thiết bị nếu khu vực tồn tại
    const device = await deviceService.createDevice(req.body);
    res.status(201).json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}


async function updateDevice(req, res) {
  try {
    const device = await deviceService.updateDevice(req.params.id, req.body);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json(device);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteDevice(req, res) {
  try {
    const device = await deviceService.deleteDevice(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa thiết bị thành công' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getDeviceById(req, res) {
  try {
    const device = await deviceService.getDeviceById(req.params.id);
    if (!device) {
      return res.status(404).json({ message: 'Thiết bị không tồn tại' });
    }
    res.status(200).json(device);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function getAllDevices(req, res) {
  try {
    const devices = await deviceService.getAllDevices();
    res.status(200).json(devices);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createDevice,
  updateDevice,
  deleteDevice,
  getDeviceById,
  getAllDevices
};
