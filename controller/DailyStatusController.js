const { getTelemetryDataFromMongoDB } = require('../services/DailyStatusService');


const getTelemetryData = async (req, res) => {
  const { deviceId, startDate, endDate } = req.query;

  try {
   
    const data = await getTelemetryDataFromMongoDB(deviceId, startDate, endDate);
   
    res.status(200).json(data);
  } catch (error) {
    
    res.status(404).json({ error: error.message });
  }
};

module.exports = {
  getTelemetryData,
};
