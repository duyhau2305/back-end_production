const Downtime = require('../models/Downtime');

// Lọc downtime với deviceID và khoảng thời gian (startDate - endDate)
const getDowntimesByFilter = async (deviceId, start, end) => {
  return await Downtime.find({
    deviceId: deviceId,
    date: { $gte: start, $lte: end }
  }).exec();
};

// Tạo downtime mới
const createDowntime = async (data) => {
  const downtime = new Downtime(data);
  return await downtime.save();
};

// Cập nhật downtime theo ID
const updateDowntime = async (id, data) => {
  return await Downtime.findByIdAndUpdate(id, data, { new: true });
};

// Xóa downtime theo ID
const deleteDowntime = async (id) => {
  return await Downtime.findByIdAndDelete(id);
};

module.exports = {
  getDowntimesByFilter,
  createDowntime,
  updateDowntime,
  deleteDowntime,
};
