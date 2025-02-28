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
                };
            }
    
            // Đặt múi giờ mặc định
            moment.tz.setDefault('Asia/Ho_Chi_Minh');
    
            const keys = [machineProfile.operationStatusKey];
            const thingsboardData = await ThingboardService.getTelemetryDataByDeviceId(
                machineProfile.tbDeviceId,
                startTs,
                endTs,
                keys
            );
            const machineStatusData = thingsboardData[machineProfile.operationStatusKey] ?? [];
    
            const machineStatusDataGroupByDay = groupBy(machineStatusData, (item) =>
                moment(item.ts).format('YYYY-MM-DD')
            );
    
            let result = [];
    
            for (let [day, statusDataPerDay] of Object.entries(machineStatusDataGroupByDay)) {
                statusDataPerDay = sortBy(statusDataPerDay, (item) => item.ts);
    
                const intervals = [];
                const totalTimeByStatus = { Stop: 0, Idle: 0, Run: 0 };
                let currentStatus = getMachineStatus(parseInt(statusDataPerDay[0].value));
                let startTs = parseInt(statusDataPerDay[0].ts);
    
                const startOfDay = moment(day).startOf('day').valueOf();
                const eightAM = moment(day).startOf('day').add(8, 'hours').valueOf();
    
                // Tính thời gian trước 8AM
                if (startTs < eightAM) {
                    for (let i = 0; i < statusDataPerDay.length; i++) {
                        const intervalStart = Math.max(statusDataPerDay[i].ts, startOfDay);
                        const intervalEnd = Math.min(
                            i + 1 < statusDataPerDay.length ? statusDataPerDay[i + 1].ts : eightAM,
                            eightAM
                        );
    
                        if (intervalStart < intervalEnd) {
                            const status = getMachineStatus(parseInt(statusDataPerDay[i].value));
                            totalTimeByStatus[status] += (intervalEnd - intervalStart) / 1000; // Tính theo giây
                        }
    
                        if (intervalEnd >= eightAM) break; // Dừng lại nếu đã vượt quá 8AM
                    }
                }
    
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
    
                // Đẩy trạng thái cuối cùng
                intervals.push({
                    status: currentStatus,
                    startTime: new Date(startTs).toISOString(),
                    endTime: new Date(statusDataPerDay[statusDataPerDay.length - 1].ts).toISOString(),
                });
    
                result.push({
                    date: moment(day).utc().toISOString(),
                    intervals: intervals,
                    totalSecondsBefore8AM: totalTimeByStatus,
                });
            }
    
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: result,
            };
        } catch (err) {
            return {
                status: constants.INTERNAL_ERROR,
                error: err,
            };
        }
    }
    
       ,

    async getSummaryStatus(params) {
        console.log(params)
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
                    const itemLogTime = new Date(item.logTime);
                    const currentTime = new Date();
                    const itemHour = itemLogTime.getHours();
                    const itemMinute = itemLogTime.getMinutes();
                    const currentHour = currentTime.getHours();
                    const currentMinute = currentTime.getMinutes();
                    if (itemHour < currentHour || (itemHour === currentHour && itemMinute < currentMinute)) {
                        if (!acc[dateKey]) {
                            acc[dateKey] = { logTime: dateKey, machineId: item.machineId, runTime: 0 };
                        }
                        acc[dateKey].runTime += item.runTime;
                    }
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


    async getProductionTask(params, type) {
        const { startTime, endTime, machineId } = params;
        try {
            let todayStart;
            let todayEnd;
            let today = new Date();

            if (type === 'machine') {
                todayStart = new Date(today);
                todayStart.setUTCHours(0, 0, 0, 0);
                todayEnd = new Date(today);
                todayEnd.setUTCHours(23, 59, 59, 999);
            } else {
                todayStart = new Date(startTime);
                todayStart.setUTCHours(0, 0, 0, 0);
                todayEnd = new Date(endTime);
                todayEnd.setUTCHours(23, 59, 59, 999);
            }
            const productionTasks = await ProductionTask.aggregate([
                {
                    $match: {
                        deviceId: machineId,
                        date: {
                            $gte: todayStart,
                            $lte: todayEnd
                        }
                    }
                },
                {
                    $lookup: {
                        from: "workshifts",
                        localField: "shifts.shiftName",
                        foreignField: "shiftName",
                        as: "shiftDetails"
                    }
                },
                {
                    $addFields: {
                        shifts: {
                            $map: {
                                input: "$shifts",
                                as: "shift",
                                in: {
                                    $mergeObjects: [ 
                                        "$$shift",
                                        {
                                            shiftDetails: {
                                                $arrayElemAt: [
                                                    { $filter: {
                                                        input: "$shiftDetails", 
                                                        as: "detail",
                                                        cond: { $eq: ["$$detail.shiftName", "$$shift.shiftName"] } // Kết nối shiftDetails với shiftName trong shifts
                                                    }},
                                                    0 // Lấy phần tử đầu tiên từ mảng filtered
                                                ]
                                            }
                                        }
                                    ]
                                }
                            }
                        }
                    }
                },
                {
                    $group: {
                        _id: "$_id",
                        date: { $first: "$date" },
                        shifts: { $first: "$shifts" },
                        __v: { $first: "$__v" }
                    }
                },
                {
                    $project: {
                        date: 1,
                        shifts: 1, // Trả về mảng shifts đã được kết hợp với shiftDetails
                        __v: 1
                    }
                }
            ]);
            
            console.log(productionTasks)
            productionTasks.sort((a, b) => new Date(a.date) - new Date(b.date));

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
    async getTopTen(params) {
        try {
            console.log(params);
            const { startTime, endTime, machineSerial, type } = params;
    
            let result    
                if (type == 1) {
                 result = await AvailabilityDay.aggregate([
                    {
                        $match: {
                            logTime: { $gte: startTime, $lte: endTime },
                            machineSerialNum: { $regex: `^${machineSerial}`, $options: "i" }  // Match machineSerialNum that starts with "P"
                        }
                    },
                    {
                        $group: {
                            _id: "$machineId",
                            totalRunTime: { $sum: "$runTime" },
                            totalStopTime: { $sum: "$stopTime" },
                            totalIdleTime: { $sum: "$idleTime" },
                            machineSerialNum: { $first: "$machineSerialNum" },
                        }
                    },
                    {
                        $sort: {
                            totalRunTime: -1  // Sort dynamically based on the type
                        }
                    },
                    {
                        $limit: 10  // Limit to top 10 records
                    }
                ]);
            } else if (type == 2) {
                 result = await AvailabilityDay.aggregate([
                    {
                        $match: {
                            logTime: { $gte: startTime, $lte: endTime },
                            machineSerialNum: { $regex: `^${machineSerial}`, $options: "i" }  // Match machineSerialNum that starts with "P"
                        }
                    },
                    {
                        $group: {
                            _id: "$machineId",
                            totalRunTime: { $sum: "$runTime" },
                            totalStopTime: { $sum: "$stopTime" },
                            totalIdleTime: { $sum: "$idleTime" },
                            machineSerialNum: { $first: "$machineSerialNum" },
                        }
                    },
                    {
                        $sort: {
                            totalIdleTime: -1  // Sort dynamically based on the type
                        }
                    },
                    {
                        $limit: 10  // Limit to top 10 records
                    }
                ]);
            } else if (type == 3) {
                 result = await AvailabilityDay.aggregate([
                    {
                        $match: {
                            logTime: { $gte: startTime, $lte: endTime },
                            machineSerialNum: { $regex: `^${machineSerial}`, $options: "i" }  // Match machineSerialNum that starts with "P"
                        }
                    },
                    {
                        $group: {
                            _id: "$machineId",
                            totalRunTime: { $sum: "$runTime" },
                            totalStopTime: { $sum: "$stopTime" },
                            totalIdleTime: { $sum: "$idleTime" },
                            machineSerialNum: { $first: "$machineSerialNum" },
                        }
                    },
                    {
                        $sort: {
                            totalStopTime: -1  // Sort dynamically based on the type
                        }
                    },
                    {
                        $limit: 10  // Limit to top 10 records
                    }
                ]);
            }
            
    
            return {
                status: constants.RESOURCE_SUCCESSFULLY_FETCHED,
                data: result
            };
        } catch (error) {
            return {
                status: constants.RESOURCE_FETCH_ERROR,
                data: error
            };
        }
    }
    


}