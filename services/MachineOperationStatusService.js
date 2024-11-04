const { groupBy, sortBy } = require("lodash");
const Device = require("../models/Device");
const ThingboardService = require("./ThingboardService");
const { getMachineStatus } = require("./UtilitiesService");
const moment = require("moment-timezone");
const constants = require("../constants/constants");
const AvailabilityDay = require("../models/AvailabilityDay");
const AvailabilityRealtime = require("../models/AvailabilityRealtime");
const UtilitiesService = require("./UtilitiesService");

module.exports = {
    async getStatusTimeline(params) {
        try {
            const { startTs, endTs, machineId } = params;
            const machineProfile = await Device.findById(machineId);
            if (!machineProfile) {
                return {
                    status: constants.RESOURCE_NOT_FOUND,
                    data: machineId
                }
            }
            const keys = [machineProfile.operationStatusKey];
            const thingsboardData = await ThingboardService.getTelemetryDataByDeviceId(machineProfile.tbDeviceId, startTs, endTs, keys);
            const machineStatusData = thingsboardData[machineProfile.operationStatusKey] ?? [];
            const machineStatusDataGroupByDay = groupBy(machineStatusData, (item) => moment(item.ts).tz('Asia/Ho_Chi_Minh').format("YYYY-MM-DD"));
            let result = [];
            for (let [day, statusDataPerDay] of Object.entries(machineStatusDataGroupByDay)) {
                statusDataPerDay = sortBy(statusDataPerDay, (item) => item.ts);
                const intervals = [];
                let currentStatus = getMachineStatus(parseInt(statusDataPerDay[0].value));
                let startTs = parseInt(statusDataPerDay[0].ts);

                for (let i = 1; i < statusDataPerDay.length; i++) {
                    const status = getMachineStatus(parseInt(statusDataPerDay[i].value));
                    if (status !== currentStatus) {
                        intervals.push({
                            status: currentStatus,
                            startTime: new Date(startTs).toISOString(),
                            endTime: new Date(statusDataPerDay[i].ts).toISOString(),
                        });
                        currentStatus = status;
                        startTs = parseInt(statusDataPerDay[i].ts);
                    }
                }

                intervals.push({
                    status: currentStatus,
                    startTime: new Date(startTs).toISOString(),
                    endTime: new Date(statusDataPerDay[statusDataPerDay.length - 1].ts).toISOString()
                });

                result.push({
                    date: moment.tz(day, 'Asia/Ho_Chi_Minh').utc().toISOString(),
                    intervals: intervals
                });
            }
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: result
            };
        } catch (err) {
            return {
                status: constants.INTERNAL_ERROR,
                error: err
            }
        }
    },
    
    async getSummaryStatus(params) {
        try {
            const { startTime, endTime, machineId } = params;
            const machineProfile = await Device.findById(machineId);
            if (!machineProfile) {
                return {
                    status: constants.RESOURCE_NOT_FOUND,
                    data: machineId
                }
            }
            const data = await AvailabilityDay.find({
                machineId: machineId,
                logTime: {
                    $gte: startTime,
                    $lte: endTime
                }
            });

            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: data
            };
        } catch (err) {
            return {
                status: constants.INTERNAL_ERROR,
                error: err
            }
        }
    },

    async getCurrentStatus(machineId) {
        try {
            const machineProfile = await Device.findById(machineId);
            if (!machineProfile) {
                return {
                    status: constants.RESOURCE_NOT_FOUND,
                    data: machineId
                }
            }
            const keys = [machineProfile.operationStatusKey];
            const thingsboardData = await ThingboardService.getLatestTelemetryDataByDeviceId(machineProfile.tbDeviceId, keys);
            const machineStatusData = thingsboardData[machineProfile.operationStatusKey] ?? [];
            let status = 'Offline';
            let currentTs = new Date().getTime();
            if (machineStatusData.length) {
                let latestStatus = UtilitiesService.getMachineStatus(parseInt(machineStatusData[0].value));
                let latestTs = parseInt(machineStatusData[0].ts);
                status = (currentTs - latestTs < 15 * 60 * 1000) ? latestStatus : status;
            }
            
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: status
            }
        } catch (err) {
            return {
                status: constants.INTERNAL_ERROR,
                error: err
            }
        }
    },

    async getPercentDiff(params) {
        try {
            const { startTime, endTime } = params;
            const data = await AvailabilityRealtime.find({
                logTime: {
                    $gte: startTime,
                    $lte: endTime
                }
            });
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: data
            };
        } catch (err) {
            return {
                status: constants.INTERNAL_ERROR,
                error: err
            }
        }
    },
}