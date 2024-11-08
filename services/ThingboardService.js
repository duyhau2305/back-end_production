const axios = require("axios");
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
    instance.defaults.headers["X-Authorization"] = `Bearer ${accessToken}`;
    if (config) {
      // the request from interceptors, they need to update the config
      config.headers["X-Authorization"] = `Bearer ${accessToken}`;
      return config;
    }
    return accessToken;
  } catch (error) {
    throw error;
  }
};

instance.interceptors.request.use(async (config) => {
  if (!config.headers["X-Authorization"] && !config.url?.includes('/api/auth/login')) {
    let newConfig = await loginFunct(config);
    return newConfig;
  }
  return config;
}, (error) => {
  logger.error(`${serviceName}::interceptors.request - ${error.message}`);
  return Promise.reject(error);
});

instance.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    if (error.response && error.response.status === 401) {
      const loginUrl = '/api/auth/login';
      const isLoginRequest = error.config.url.includes(loginUrl);
      if (!isLoginRequest) {
        let newConfig = await loginFunct(error.config);
        return instance.request(newConfig);
      }
    }
    return Promise.reject(error);
  }
);
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
  },
  async callRpc(params) {
    console.log("join here")
    console.log(params)

    try {
      const buildUrl = `${THINGBOARD_API_URL}/api/rpc/oneway/${params.deviceId}`;
      const response = await instance.post(buildUrl, {
        method: params.controlKey,
        params: params.value,
        timeout: 500
      });
      logger.info(`${serviceName}.getLatestTelemetryDataByDeviceId() - Get telemetry data by device id = ${params.deviceId} success.`)
      return response.data;
    } catch (error) {
      throw error;
    }
  }
}