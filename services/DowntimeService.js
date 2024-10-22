const Downtime = require('../models/Downtime');

// Lọc downtime với deviceID và khoảng thời gian (startDate - endDate)
const getDowntimesByFilter = async (deviceID, startDate, endDate) => {
  const filter = {};

  if (deviceID) filter.deviceID = deviceID;
  
  if (startDate && endDate) {
    filter.date = { 
      $gte: new Date(startDate), 
      $lte: new Date(endDate) 
    };
  }

  return await Downtime.find(filter);
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
