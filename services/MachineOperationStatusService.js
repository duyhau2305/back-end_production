const { groupBy, sortBy } = require("lodash");
const Device = require("../models/Device");
const ThingboardService = require("./ThingboardService");
const { getMachineStatus } = require("./UtilitiesService");
const moment = require("moment-timezone");
const constants = require("../constants/constants");
const AvailabilityDay = require("../models/AvailabilityDay");
const AvailabilityRealtime = require("../models/AvailabilityRealtime");
const UtilitiesService = require("./UtilitiesService");
const ProductionTask = require("../models/ProductionTask");
const AvailabilityHour = require("../models/AvailabilityHour");

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

    // async getPercentDiff(params) {
    //     try {
    //         const { startTime, endTime } = params;
    //         const data = await AvailabilityRealtime.find({
    //             logTime: {
    //                 $gte: startTime,
    //                 $lte: endTime
    //             }
    //         });
    //         return {
    //             status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
    //             data: data
    //         };
    //     } catch (err) {
    //         return {
    //             status: constants.INTERNAL_ERROR,
    //             error: err
    //         }
    //     }
    // },
    async getAllMachine() {
        try {
            const devices = await Device.find({}, '_id operationStatusKey deviceId');
            const filteredData = devices.map(({ _id, operationStatusKey, deviceId }) => ({ _id, operationStatusKey, deviceId }));
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: filteredData
            };
        } catch (error) {
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: error
            };
        }
    },
    async getPercentDiff(params) {

        try {
            const { startTime, endTime, machineId } = params;
            const getSummaryStatus = await AvailabilityHour.find({
                machineId: machineId,
                logTime: {
                    $gte: startTime,
                    $lte: endTime
                }
            });
            const groupedData = getSummaryStatus.reduce((acc, item) => {
                if (!acc[item.machineId]) acc[item.machineId] = [];
                acc[item.machineId].push({
                    logTime: item.logTime,
                    machineId: item.machineId,
                    runTime: item.runTime
                });
                return acc;
            }, {});
            const resultsPercent = Object.values(groupedData).map(dataArray => {
                const dailySums = dataArray.reduce((acc, item) => {
                    const dateKey = new Date(item.logTime).toISOString().split('T')[0];
                    if (!acc[dateKey]) {
                        acc[dateKey] = { logTime: dateKey, machineId: item.machineId, runTime: 0 };
                    }
                    acc[dateKey].runTime += item.runTime;
                    return acc;
                }, {});
                const sortedData = Object.values(dailySums).sort((a, b) => new Date(a.logTime) - new Date(b.logTime));
                return sortedData.slice(1).map((current, index) => {
                    const previous = sortedData[index];
                    const percentageChange = previous.runTime === 0
                        ? current.runTime + '%'
                        : ((current.runTime - previous.runTime) / previous.runTime) * 100;

                    return {
                        logTime: current.logTime,
                        machineId: current.machineId,
                        percentageChange: isFinite(percentageChange) ? percentageChange.toFixed(2) + '%' : '0%'
                    };
                });
            });

            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: resultsPercent
            };
        } catch (error) {
            return {
                status: constants.INTERNAL_ERROR,
                error: error
            }
        }
    },

    async getProductionTask(params) {
        const { startTime, endTime, machineId } = params;
        try {
            const currentTime = new Date();
            const currentHourMinute = currentTime.getHours() * 60 + currentTime.getMinutes(); // Chuyển giờ hiện tại sang phút để so sánh

            const productionTasks = await ProductionTask.aggregate([
                {
                    $match: {
                        deviceName: machineId,
                        date: {
                            $gte: new Date(currentTime.setHours(0, 0, 0, 0)), // Lấy bản ghi có date là hôm nay
                            $lte: new Date(currentTime.setHours(23, 59, 59, 999))
                        }
                    }
                },
                { $unwind: "$shifts" },
                {
                    $lookup: {
                        from: "workshifts",
                        localField: "shifts.shiftName",
                        foreignField: "shiftName",
                        as: "shiftDetails"
                    }
                },
                {
                    $unwind: {
                        path: "$shiftDetails",
                        preserveNullAndEmptyArrays: true
                    }
                },
                {
                    $addFields: {
                        shiftStartMinutes: {
                            $add: [
                                { $multiply: [{ $toInt: { $substr: ["$shiftDetails.startTime", 0, 2] } }, 60] },
                                { $toInt: { $substr: ["$shiftDetails.startTime", 3, 2] } }
                            ]
                        },
                        shiftEndMinutes: {
                            $add: [
                                { $multiply: [{ $toInt: { $substr: ["$shiftDetails.endTime", 0, 2] } }, 60] },
                                { $toInt: { $substr: ["$shiftDetails.endTime", 3, 2] } }
                            ]
                        }
                    }
                },
                {
                    $match: {
                        $expr: {
                            $and: [
                                { $lte: ["$shiftStartMinutes", currentHourMinute] },
                                { $gte: ["$shiftEndMinutes", currentHourMinute] }
                            ]
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        shifts: {
                            $push: {
                                employeeName: "$shifts.employeeName",
                                status: "$shifts.status",
                                startTime: "$shiftDetails.startTime",
                                endTime: "$shiftDetails.endTime",
                                breakTime: "$shiftDetails.breakTime"
                            }
                        },
                        __v: { $first: "$__v" }
                    }
                },
                {
                    $project: {
                        shifts: 1
                    }
                }
            ]);

            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: productionTasks
            };
        } catch (error) {
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: error
            };
        }
    },

}