const constants = require("../constants/constants");
const Device = require("../models/Device");
const HttpResponseService = require("../services/HttpResponseService");
const MachineOperationStatusService = require("../services/MachineOperationStatusService");
const moment = require('moment');
const { DateTime } = require('luxon');
const ThingboardService = require("../services/ThingboardService");
const cron = require('node-cron');
const cronTasks = new Map();
const now = DateTime.now();

module.exports = {
    async getStatusTimeline(req, res) {
        try {
            const machineId = req.params.machineId;
            const { startTime, endTime } = req.query;
            const params = {
                machineId: machineId,
                startTs: new Date(startTime).getTime(),
                endTs: new Date(endTime).getTime()
            }
            const getStatusTimeline = await MachineOperationStatusService.getStatusTimeline(params);
            switch (getStatusTimeline.status) {
                case constants.RESOURCE_SUCCESSFULLY_FETCHED:
                    return HttpResponseService.success(res, constants.SUCCESS, getStatusTimeline.data);
                case constants.RESOURCE_NOT_FOUND:
                    const errMsg = `No machine found with id = ${machineId}`;
                    return HttpResponseService.notFound(res, errMsg);
                default:
                    return HttpResponseService.internalServerError(res, getStatusTimeline);
            }
        } catch (error) {
            return HttpResponseService.internalServerError(res, error);
        }
    },

    async getSummaryStatus(req, res) {
        try {
            const machineId = req.params.machineId;
            const { startTime, endTime } = req.query;
            const params = {
                machineId: machineId,
                startTime: startTime,
                endTime: endTime
            }
            const getSummaryStatus = await MachineOperationStatusService.getSummaryStatus(params);
            switch (getSummaryStatus.status) {
                case constants.RESOURCE_SUCCESSFULLY_FETCHED:
                    return HttpResponseService.success(res, constants.SUCCESS, getSummaryStatus.data);
                case constants.RESOURCE_NOT_FOUND:
                    const errMsg = `No machine found with id = ${machineId}`;
                    return HttpResponseService.notFound(res, errMsg);
                default:
                    return HttpResponseService.internalServerError(res, getSummaryStatus);
            }
        } catch (error) {
            return HttpResponseService.internalServerError(res, error);
        }
    },
    async getMachine(req, res) {
        try {
            const devices = await Device.find({}, '_id operationStatusKey deviceId');
            const filteredData = devices.map(({ _id, operationStatusKey, deviceId }) => ({ _id, operationStatusKey, deviceId }));
            return HttpResponseService.success(res, constants.SUCCESS, filteredData);
        } catch (error) {
            return HttpResponseService.internalServerError(res, filteredData);
        }
    },
    // async getPercentDiff(req, res) {
    //     try {

    //         const { startTime, endTime } = req.query;
    //         const params = { startTime, endTime };
    //         const getSummaryStatus = await MachineOperationStatusService.getPercentDiff(params);

    //         if (getSummaryStatus.status !== constants.RESOURCE_SUCCESSFULLY_FETCHED) {
    //             const errMsg = `No machine found with id = ${machineId}`;
    //             return getSummaryStatus.status === constants.RESOURCE_NOT_FOUND
    //                 ? HttpResponseService.notFound(res, errMsg)
    //                 : HttpResponseService.internalServerError(res, getSummaryStatus);
    //         }

    //         const groupedData = getSummaryStatus.data.reduce((acc, item) => {
    //             if (!acc[item.machineId]) acc[item.machineId] = [];
    //             acc[item.machineId].push({
    //                 logTime: item.logTime,
    //                 machineId: item.machineId,
    //                 runTime: item.runTime
    //             });
    //             return acc;
    //         }, {});

    //         const resultsPercent = Object.values(groupedData).map(dataArray => {
    //             const dailySums = dataArray.reduce((acc, item) => {
    //                 const dateKey = new Date(item.logTime).toISOString().split('T')[0];
    //                 if (!acc[dateKey]) {
    //                     acc[dateKey] = { logTime: dateKey, machineId: item.machineId, runTime: 0 };
    //                 }
    //                 acc[dateKey].runTime += item.runTime;
    //                 return acc;
    //             }, {});

    //             const sortedData = Object.values(dailySums).sort((a, b) => new Date(a.logTime) - new Date(b.logTime));
    //             return sortedData.slice(1).map((current, index) => {
    //                 const previous = sortedData[index];
    //                 const percentageChange = previous.runTime === 0
    //                     ? current.runTime + '%'
    //                     : ((current.runTime - previous.runTime) / previous.runTime) * 100;

    //                 return {
    //                     logTime: current.logTime,
    //                     machineId: current.machineId,
    //                     percentageChange: isFinite(percentageChange) ? percentageChange.toFixed(2) + '%' : '0%'
    //                 };
    //             });
    //         });

    //         return HttpResponseService.success(res, constants.SUCCESS, resultsPercent);
    //     } catch (error) {
    //         return HttpResponseService.internalServerError(res, error);
    //     }
    // },

    // async getInformationAllMachine(req, res) {
    //     try {
    //         const startTime = moment().subtract('days').startOf('day').toISOString();
    //         const endTime = moment().toISOString();
    //         const allMachine = await MachineOperationStatusService.getAllMachine();
    //         if (allMachine.status === constants.RESOURCE_NOT_FOUND) {
    //             return HttpResponseService.notFound(res, "No machines found.");
    //         }
    //         if (allMachine.status !== constants.RESOURCE_SUCCESSFULLY_FETCHED) {
    //             return HttpResponseService.internalServerError(res, allMachine);
    //         }
    //         const createParams = (machineId, isSummary = false) => ({
    //             machineId,
    //             startTime: startTime,
    //             endTime: endTime,
    //             ...(isSummary ? {} : { startTs: new Date(startTime).getTime(), endTs: new Date(endTime).getTime() })
    //         });
    //         const startPercent = moment().subtract(1,'days').startOf('day').toISOString();

    //         const result = await Promise.all(
    //             allMachine.data.map(async (machine) => {
    //                 const paramsProductionTask = createParams(machine.deviceId);
    //                 const paramsSummary = createParams(machine._id, true);
    //                 const timelineParams = createParams(machine._id);
    //                 const paramsPercentDiff = {
    //                     machineId : machine._id,
    //                     startTime: startPercent,
    //                     endTime: endTime,
    //                 }
    //                 const [currentStatus, productionTasks, percentDiff, summaryStatus] = await Promise.all([
    //                     MachineOperationStatusService.getCurrentStatus(machine._id),
    //                     MachineOperationStatusService.getProductionTask(paramsProductionTask, 'machine'),
    //                     MachineOperationStatusService.getPercentDiff(paramsPercentDiff),
    //                     MachineOperationStatusService.getSummaryStatus(paramsSummary),
    //                 ]);
    //                 let totalBreakTimeInMinutes = 0; 
    //                 let timeRange = null;

    //                 if (productionTasks?.data?.length > 0 && productionTasks.data[0]?.shifts?.length > 0 && productionTasks.data[0].shifts[0]?.shiftDetails.breakTime) {
    //                     productionTasks.data[0].shifts[0].shiftDetails.breakTime.forEach((breakPeriod) => {
    //                         const breakStart = moment(breakPeriod.startTime, "HH:mm");
    //                         const breakEnd = moment(breakPeriod.endTime, "HH:mm");
    //                         const currentTime = moment(); // Thời gian hiện tại

    //                         // Nếu thời gian hiện tại đã qua thời gian kết thúc của khoảng nghỉ này, cộng khoảng thời gian đó vào tổng
    //                         if (currentTime.isAfter(breakEnd)) {
    //                             totalBreakTimeInMinutes += breakEnd.diff(breakStart, "minutes");
    //                         }
    //                         // Nếu hiện tại nằm trong khoảng thời gian nghỉ, chỉ tính thời gian đã trôi qua từ đầu khoảng nghỉ
    //                         else if (currentTime.isBetween(breakStart, breakEnd)) {
    //                             totalBreakTimeInMinutes += currentTime.diff(breakStart, "minutes");
    //                         }
    //                     });
    //                 }

    //                 if (productionTasks.data.length > 0 && productionTasks.data[0].shifts && productionTasks.data[0].shifts.length > 0  ) {
    //                 const lastShift = productionTasks.data[0].shifts[productionTasks.data[0].shifts.length - 1];
    //                     console.log(lastShift)

    //                     const lastBreakEndTime = lastShift.shiftDetails.endTime;

    //                     if (lastBreakEndTime) {
    //                         timeRange = `8h-${lastBreakEndTime}`;
    //                     }
    //                 }
    //                 const currentMoment = moment().tz("Asia/Ho_Chi_Minh");
    //                 const currentHour = currentMoment.hours();
    //                 const currentMinute = currentMoment.minutes();
    //                 const totalMinutesFrom8AM = (currentHour - 8) * 60 + currentMinute;
    //                 const adjustedRunTime = totalMinutesFrom8AM - totalBreakTimeInMinutes;
    //                 const machinePercent = (((summaryStatus.data?.[0]?.runTime || 0) / 60 )/ adjustedRunTime) * 100;
    //                 const timeline = await MachineOperationStatusService.getStatusTimeline(timelineParams);
    //                 const lastInterval = timeline?.data?.[0]?.intervals?.at(-1);
    //                 return {
    //                     ...machine,
    //                     currentStatus: currentStatus.data,
    //                     productionTasks: productionTasks.data,
    //                     percentDiff: percentDiff.data?.[0]?.[1]?.percentageChange,
    //                     summaryStatus: summaryStatus.data?.[0]?.runTime || 0,
    //                     summaryStatusIdle: summaryStatus.data?.[0]?.idleTime || 0,
    //                     summaryStatusStop: summaryStatus.data?.[0]?.stopTime || 0,
    //                     timelineEndTime: lastInterval?.endTime,
    //                     timelineStartTime: lastInterval?.startTime,
    //                     machinePercent: machinePercent,
    //                     timeRange : timeRange
    //                 };
    //             })
    //         );

    //         return HttpResponseService.success(res, constants.SUCCESS, result);
    //     } catch (error) {
    //         console.error("Error in getInformationAllMachine:", error);
    //         return HttpResponseService.internalServerError(res, error);
    //     }
    // },
    async getInformationAllMachine(req, res) {
        try {
            const startTime = moment().subtract('days').startOf('day').toISOString();
            const endTime = moment().toISOString();
            const allMachine = await MachineOperationStatusService.getAllMachine();
            if (allMachine.status === constants.RESOURCE_NOT_FOUND) {
                return HttpResponseService.notFound(res, "No machines found.");
            }
            if (allMachine.status !== constants.RESOURCE_SUCCESSFULLY_FETCHED) {
                return HttpResponseService.internalServerError(res, allMachine);
            }
            const createParams = (machineId, isSummary = false) => ({
                machineId,
                startTime: startTime,
                endTime: endTime,
                ...(isSummary ? {} : { startTs: new Date(startTime).getTime(), endTs: new Date(endTime).getTime() })
            });
            const yesterday = new Date();
            yesterday.setDate(yesterday.getDate() - 1);
            const summary = yesterday.toISOString().split('T')[0] + "T17:00:00.000Z";
            const startPercent = yesterday.toISOString().split('T')[0] + "T00:00:00.000Z";

            const result = await Promise.all(
                allMachine.data.map(async (machine) => {
                    const paramsProductionTask = createParams(machine.deviceId);
                    const timelineParams = createParams(machine._id);
                    const paramsPercentDiff = {
                        machineId: machine._id,
                        startTime: startPercent,
                        endTime: endTime,
                    }
                    const paramsSummary = {
                        machineId: machine._id,
                        startTime: summary,
                        endTime: endTime,
                    }
                    const [currentStatus, productionTasks, percentDiff, summaryStatus] = await Promise.all([
                        MachineOperationStatusService.getCurrentStatus(machine._id),
                        MachineOperationStatusService.getProductionTask(paramsProductionTask, 'machine'),
                        MachineOperationStatusService.getPercentDiff(paramsPercentDiff),
                        MachineOperationStatusService.getSummaryStatus(paramsSummary),
                    ]);
                    let totalBreakTimeInMinutes = 0;
                    let timeRange = null;

                    if (
                        productionTasks?.data?.length > 0 &&
                        productionTasks.data[0]?.shifts?.length > 0 &&
                        productionTasks.data[0].shifts[0]?.shiftDetails.breakTime
                    ) {
                        const currentTime = moment();
                        const isBreakTimeExceeded = productionTasks.data[0].shifts[0].shiftDetails.breakTime.some(breakPeriod => {
                            const breakEnd = moment(breakPeriod.endTime, "HH:mm");
                            return breakEnd.isAfter(currentTime);
                        });

                        if (isBreakTimeExceeded) {
                            totalBreakTimeInMinutes = 0;
                        } else {
                            totalBreakTimeInMinutes = productionTasks.data[0].shifts[0].shiftDetails.breakTime.reduce((total, breakPeriod) => {
                                const breakStart = moment(breakPeriod.startTime, "HH:mm");
                                const breakEnd = moment(breakPeriod.endTime, "HH:mm");
                                return total + breakEnd.diff(breakStart, "minutes");
                            }, 0);
                        }
                    }
                    if (productionTasks.data.length > 0 && productionTasks.data[0].shifts && productionTasks.data[0].shifts.length > 1) {
                        const lastShift = productionTasks.data[0].shifts[productionTasks.data[0].shifts.length - 1];
                        console.log(lastShift)

                        const lastBreakEndTime = lastShift.shiftDetails.endTime;

                        if (lastBreakEndTime) {
                            timeRange = `8h-${lastBreakEndTime}`;
                        }
                    }
                    const currentMoment = moment().tz("Asia/Ho_Chi_Minh");
                    const currentHour = currentMoment.hours();
                    const currentMinute = currentMoment.minutes();
                    const totalMinutesFrom8AM = (currentHour - 8) * 60 + currentMinute;
                    const adjustedRunTime = totalMinutesFrom8AM - totalBreakTimeInMinutes;
                    const machinePercent = ((summaryStatus.data?.[0]?.runTime || 0) / 60 / adjustedRunTime) * 100;
                    const timeline = await MachineOperationStatusService.getStatusTimeline(timelineParams);
                    const lastInterval = timeline?.data?.[0]?.intervals?.at(-1);
                    return {
                        ...machine,
                        currentStatus: currentStatus.data,
                        productionTasks: productionTasks.data,
                        percentDiff: percentDiff.data?.[0]?.[0]?.percentageChange,
                        // percentDiff: percentDiff,
                        summaryStatus: summaryStatus.data?.[0]?.runTime || 0,
                        summaryStatusIdle: summaryStatus.data?.[0]?.idleTime || 0,
                        summaryStatusStop: summaryStatus.data?.[0]?.stopTime || 0,
                        timelineEndTime: lastInterval?.endTime,
                        timelineStartTime: lastInterval?.startTime,
                        machinePercent: machinePercent,
                        timeRange: timeRange
                    };
                })
            );

            return HttpResponseService.success(res, constants.SUCCESS, result);
        } catch (error) {
            console.error("Error in getInformationAllMachine:", error);
            return HttpResponseService.internalServerError(res, error);
        }
    },
    async getInformationAnalysis(req, res) {
        try {
            const { startTime, endTime } = req.query;
            const allMachine = await MachineOperationStatusService.getAllMachine();
            if (allMachine.status === constants.RESOURCE_NOT_FOUND) {
                return HttpResponseService.notFound(res, "No machines found.");
            }
            if (allMachine.status !== constants.RESOURCE_SUCCESSFULLY_FETCHED) {
                return HttpResponseService.internalServerError(res, allMachine);
            }
            const createParams = (machineId, isSummary = false) => ({
                machineId,
                startTime: startTime,
                endTime: endTime,
                ...(isSummary ? {} : { startTs: new Date(startTime).getTime(), endTs: new Date(endTime).getTime() })
            });

            const summaryStatuses = await MachineOperationStatusService.getSummaryStatus(createParams(allMachine.data.map(machine => machine._id), true));

            const result = await Promise.all(
                allMachine.data.map(async (machine, index) => {
                    const paramsProductionTask = createParams(machine.deviceId);
                    const paramsSummary = createParams(machine._id, true);
                    const timelineParams = createParams(machine._id);

                    const [currentStatus, productionTasks] = await Promise.all([
                        MachineOperationStatusService.getCurrentStatus(machine._id),
                        MachineOperationStatusService.getProductionTask(paramsProductionTask, 'analysis'),
                    ]);
                    const timeline = await MachineOperationStatusService.getStatusTimeline(timelineParams);
                    const lastInterval = timeline?.data?.[0]?.intervals?.at(-1);

                    const summaryStatusByMachine = await summaryStatuses.data.filter(value => {

                        return value.machineId == machine._id
                    })

                    return {
                        ...machine,
                        currentStatus: currentStatus.data,
                        productionTasks: productionTasks.data,
                        summaryStatus: summaryStatusByMachine,
                        timelineEndTime: lastInterval?.endTime,
                        timelineStartTime: lastInterval?.startTime,
                    };
                })
            );
            // .data?.[0]?.runTime || 0
            return HttpResponseService.success(res, constants.SUCCESS, result);
        } catch (error) {
            console.error("Error in getInformationAllMachine:", error);
            return HttpResponseService.internalServerError(res, error);
        }
    },
    async getTopTenRunTime(req, res) {
        try {

            const { startTime, endTime, type, machineSerial } = req.query;
            const params = { startTime, endTime, type, machineSerial };
            const getTopTen = await MachineOperationStatusService.getTopTen(params)
            return HttpResponseService.success(res, constants.SUCCESS, getTopTen);

        } catch (error) {
            console.error("Error in getTopTenRunTime:", error);
            return HttpResponseService.internalServerError(res, error);
        }
    },
    async callRpc(req, res) {
        const { deviceId, controlKey, value, index, dates } = req.body;
        const params = { deviceId, controlKey, value };
        try {
            const callRpcResult = await ThingboardService.callRpc(params);
            return HttpResponseService.success(res, constants.SUCCESS, callRpcResult);
        } catch (error) {
            if (!res.headersSent) {
                return HttpResponseService.internalServerError(res, error);
            }
        }
    },
    // async cancelScheduledTask(req, res) {
    //     const machineId = req.body.machineId
    //     const task = cronTasks.get(machineId);
    //     if (task) {
    //         task.stop();
    //         cronTasks.delete(machineId);
    //         return { success: true, message: `Task for machineId ${machineId} has been canceled.` };
    //     } else {
    //         return { success: false, message: `No task found for deviceId ${machineId}.` };
    //     }
    // }



}