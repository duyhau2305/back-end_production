const { groupBy, sortBy } = require("lodash");
const HttpNotFoundException = require("../exeptions/HttpNotFoundExeption");
const Device = require("../models/Device");
const ThingboardService = require("./ThingboardService");
const { getMachineStatus } = require("./UtilitiesService");
const moment = require("moment-timezone");

module.exports = {
    async getStatusTimeline(params) {
        const {startTs, endTs, machineId} = params;
        const machineProfile = await Device.findById(machineId);
        if (!machineProfile) {
            throw new HttpNotFoundException(`Can not find machine with id = ${machineId}`);
        }
        const keys = [machineProfile.operationStatusKey];
        const thingsboardData = await ThingboardService.getTelemetryDataByDeviceId(machineProfile.tbDeviceId, startTs, endTs, keys);
        const machineStatusData = thingsboardData[machineProfile.operationStatusKey] ?? [];
        console.log(machineStatusData.length)
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
        return result;
    }
}