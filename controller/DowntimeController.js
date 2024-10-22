const downtimeService = require('../services/DowntimeService');

// Lấy downtime với bộ lọc deviceID và khoảng thời gian
const getDowntimesByFilter = async (req, res) => {
  try {
    const { deviceID, startDate, endDate } = req.query; // Lấy query parameters
    const downtimes = await downtimeService.getDowntimesByFilter(deviceID, startDate, endDate);
    res.status(200).json(downtimes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Tạo downtime mới
const createDowntime = async (req, res) => {
  try {
    const downtime = await downtimeService.createDowntime(req.body);
    res.status(201).json(downtime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Cập nhật downtime theo ID
const updateDowntime = async (req, res) => {
  try {
    const updatedDowntime = await downtimeService.updateDowntime(req.params.id, req.body);
    res.status(200).json(updatedDowntime);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Xóa downtime theo ID
const deleteDowntime = async (req, res) => {
  try {
    await downtimeService.deleteDowntime(req.params.id);
    res.status(200).json({ message: 'Đã xóa thành công' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDowntimesByFilter,
  createDowntime,
  updateDowntime,
  deleteDowntime,
};
