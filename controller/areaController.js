const Area = require('../models/areaModel');

// Thêm một khu vực mới
exports.createArea = async (req, res) => {
  try {
    const newArea = new Area(req.body);
    const savedArea = await newArea.save();
    res.status(201).json(savedArea);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Lấy danh sách tất cả khu vực
exports.getAreas = async (req, res) => {
  try {
    const areas = await Area.find();
    res.status(200).json(areas);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Sửa thông tin khu vực
exports.updateArea = async (req, res) => {
  try {
    const updatedArea = await Area.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updatedArea);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Xóa khu vực
exports.deleteArea = async (req, res) => {
  try {
    await Area.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: 'Area deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
