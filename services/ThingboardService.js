const axios = require('axios');
const logger = require('../config/logger');
const { MAX_RECORD_FETCHED } = require('../constants/thingsboard');
const serviceName = 'ThingsboardService';

const THINGBOARD_API_URL = process.env.THINGBOARD_URL;
const USERNAME = process.env.THINGBOARD_USERNAME || 'qcs2024@gmail.com';
const PASSWORD = process.env.THINGBOARD_PASSWORD || 'Qcs@2024';

const instance = axios.create({});

const loginFunct = async (config) => {
  try {
    const response = await axios.post(`${THINGBOARD_API_URL}/api/auth/login`, {
      username: USERNAME,
      password: PASSWORD,
    });
    const accessToken = response.data.token;
    logger.info(`Login Thingsboard success, accessToken = ${accessToken}`);
    instance.defaults.headers["Authorization"] = `Bearer ${accessToken}`;
    if (config) {
      // the request from interceptors, they need to update the config
      config.headers["Authorization"] = `Bearer ${accessToken}`;
      return config;
    }
  } catch (error) {
    throw error;
  }
};

instance.interceptors.request.use(async (config) => {
  if (!config.headers["Authorization"] && !config.url?.includes('/api/auth/login')) {
    let newConfig = await loginFunct(config);
    return newConfig;
  } else {
    return config;
  }
}, (error) => {
  logger.error(`${serviceName}::interceptors.request - ${error.message}`);
  return Promise.reject(error);
});

instance.interceptors.response.use((response) => response, (error) => {
  if (error.response && error.response.data) {
    let { status } = error.response.data;
    if (status === 401) {
      // refeshing token.
      let newConfig = loginFunct(error.config);
      return instance.request(newConfig);
    }
  }
  return Promise.reject(error);
});

module.exports = {
  async getTelemetryDataByDeviceId(deviceId, startTs, endTs, keys) {
    try {
      let keysString = keys.length ? keys.join(',') : ' ';
      const buildUrl = `${THINGBOARD_API_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keysString}&limit=${MAX_RECORD_FETCHED}&startTs=${startTs}&endTs=${endTs}`;
      const response = await instance.get(buildUrl);
      logger.info(`${serviceName}.getTelemetryDataByDeviceId() - Get telemetry data by device id = ${deviceId} success.`)
      return response.data;
    } catch (error) {
      throw error;
    }
  },
  async getLatestTelemetryDataByDeviceId(deviceId, keys) {
    try {
      let keysString = keys.length ? keys.join(',') : ' ';
      const buildUrl = `${THINGBOARD_API_URL}/api/plugins/telemetry/DEVICE/${deviceId}/values/timeseries?keys=${keysString}`;
      const response = await instance.get(buildUrl);
      logger.info(`${serviceName}.getLatestTelemetryDataByDeviceId() - Get telemetry data by device id = ${deviceId} success.`)
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}