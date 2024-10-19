const DailySummaryService = require('../services/DailySummaryService');

const getDailySummary = async (req, res) => {
  const { deviceId, date } = req.params;

  try {
    const summary = await DailySummaryService.getDailySummary(deviceId, date);
    return res.status(200).json(summary);
  } catch (error) {
    console.error('Lỗi khi lấy DailySummary:', error);
    return res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getDailySummary,
};
