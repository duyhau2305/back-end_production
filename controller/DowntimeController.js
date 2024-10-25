const downtimeService = require('../services/DowntimeService');

// Lấy downtime với bộ lọc deviceID và khoảng thời gian
const getDowntimesByFilter = async (req, res) => {
  try {
    const { deviceId, startDate, endDate } = req.query;

    const start = new Date(`${startDate}T00:00:00Z`);
    const end = new Date(`${endDate}T23:59:59Z`); // Bao phủ toàn bộ ngày

    const downtimes = await downtimeService.getDowntimesByFilter(deviceId, start, end);
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
