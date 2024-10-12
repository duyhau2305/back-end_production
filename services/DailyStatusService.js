const axios = require('axios');
const moment = require('moment');
const DailyStatus = require('../models/DailyStatus'); 

const THINGBOARD_API_URL = 'http://cloud.datainsight.vn:8080';
const USERNAME = 'oee2024@gmail.com';
const PASSWORD = 'Oee@2124';
let accessToken = null;

// get access token from ThingBoard
const getAccessToken = async () => {
  try {
    const response = await axios.post(`${THINGBOARD_API_URL}/api/auth/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    accessToken = response.data.token;
    return accessToken;
  } catch (error) {
    throw new Error('Failed to get access token');
  }
};

// get telemetry from ThingBoard
const getTelemetryData = async (deviceId, startDate, endDate) => {
  if (!accessToken) {
    accessToken = await getAccessToken();
  }

  const startTimestamp = moment(startDate).startOf('day').valueOf();
  const endTimestamp = moment(endDate).endOf('day').valueOf();

  try {
    const response = await axios.get(
      `${THINGBOARD_API_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=status&interval=36000&limit=10000&startTs=${startTimestamp}&endTs=${endTimestamp}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data.status;
  } catch (error) {
    if (error.response && error.response.status === 401) {
      accessToken = await getAccessToken();
      return await getTelemetryData(deviceId, startDate, endDate);
    } else {
      throw new Error('Failed to fetch telemetry data');
    }
  }
};


const processTelemetryData = async (deviceId, startDate, endDate) => {
  const telemetryData = await getTelemetryData(deviceId, startDate, endDate);

  // processData
  const processedData = telemetryData.map((item) => ({
    date: moment(item.ts).format('YYYY-MM-DD'),
    deviceId,
    status: item.value === '1' ? 'Chạy' : 'Dừng',
    startTime: moment(item.ts).format('HH:mm'),
    endTime: moment(item.ts + 3600000).format('HH:mm'), 
  }));

  //groupedData by date
  const groupedData = processedData.reduce((acc, curr) => {
    const date = curr.date;

    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push({
      status: curr.status,
      startTime: curr.startTime,
      endTime: curr.endTime,
    });

    return acc;
  }, {});

  // save date in MongoDB
  for (const date in groupedData) {
    const existingRecord = await DailyStatus.findOne({ deviceId, date });

    if (existingRecord) {
      // i haved a record, update intervals
      existingRecord.intervals = groupedData[date];
      await existingRecord.save();
    } else {
      // Create new record
      const newDailyStatus = new DailyStatus({
        deviceId,
        date,
        intervals: groupedData[date],
      });
      await newDailyStatus.save();
    }
  }

  return groupedData;
};

module.exports = {
  processTelemetryData,
};
