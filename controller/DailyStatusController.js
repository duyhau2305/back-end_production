const dailyStatusService = require('../services/DailyStatusService');


const getTelemetry = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;

  if (!deviceId || !startDate || !endDate) {
    return res.status(400).json({ error: 'Missing parameters: deviceId, startDate, endDate' });
  }

  try {
    const data = await dailyStatusService.processTelemetryData(deviceId, startDate, endDate);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getTelemetry,
};
