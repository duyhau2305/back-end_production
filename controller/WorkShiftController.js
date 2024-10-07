
const workShiftService = require('../services/WorkShiftService');

async function getAllWorkShifts(req, res) {
  try {
    const shifts = await workShiftService.getAllWorkShifts();
    res.status(200).json(shifts);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy danh sách ca làm việc', error });
  }
}

async function getWorkShiftById(req, res) {
  try {
    const shift = await workShiftService.getWorkShiftById(req.params.id);
    if (!shift) {
      return res.status(404).json({ message: 'Ca làm việc không tồn tại' });
    }
    res.status(200).json(shift);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi lấy thông tin ca làm việc', error });
  }
}

async function createWorkShift(req, res) {
  try {
    const newShift = await workShiftService.createWorkShift(req.body);
    res.status(201).json(newShift);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi tạo ca làm việc', error });
  }
}

async function updateWorkShift(req, res) {
  try {
    const updatedShift = await workShiftService.updateWorkShift(req.params.id, req.body);
    if (!updatedShift) {
      return res.status(404).json({ message: 'Ca làm việc không tồn tại' });
    }
    res.status(200).json(updatedShift);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi cập nhật ca làm việc', error });
  }
}

async function deleteWorkShift(req, res) {
  try {
    const deletedShift = await workShiftService.deleteWorkShift(req.params.id);
    if (!deletedShift) {
      return res.status(404).json({ message: 'Ca làm việc không tồn tại' });
    }
    res.status(200).json({ message: 'Xóa ca làm việc thành công' });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi khi xóa ca làm việc', error });
  }
}

module.exports = {
  getAllWorkShifts,
  getWorkShiftById,
  createWorkShift,
  updateWorkShift,
  deleteWorkShift
};
