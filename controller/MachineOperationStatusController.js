const constants = require("../constants/constants");
const Device = require("../models/Device");
const HttpResponseService = require("../services/HttpResponseService");
const MachineOperationStatusService = require("../services/MachineOperationStatusService");
const moment = require('moment');
const ThingboardService = require("../services/ThingboardService");
const cron = require('node-cron');
const cronTasks = new Map();

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

    async getInformationAllMachine(req, res) {
        try {
            const startTime = moment().subtract(1, 'days').startOf('day').toISOString();
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

            const result = await Promise.all(
                allMachine.data.map(async (machine) => {
                    const paramsProductionTask = createParams(machine.deviceId);
                    const paramsSummary = createParams(machine._id, true);
                    const timelineParams = createParams(machine._id);

                    const [currentStatus, productionTasks, percentDiff, summaryStatus] = await Promise.all([
                        MachineOperationStatusService.getCurrentStatus(machine._id),
                        MachineOperationStatusService.getProductionTask(paramsProductionTask, 'machine'),
                        MachineOperationStatusService.getPercentDiff(paramsSummary),
                        MachineOperationStatusService.getSummaryStatus(paramsSummary),
                    ]);
                    const timeline = await MachineOperationStatusService.getStatusTimeline(timelineParams);

                    const lastInterval = timeline?.data?.[0]?.intervals?.at(-1);
                    return {
                        ...machine,
                        currentStatus: currentStatus.data,
                        productionTasks: productionTasks.data,
                        percentDiff: percentDiff.data?.[0]?.[0]?.percentageChange,
                        summaryStatus: summaryStatus.data?.[0]?.runTime || 0,
                        summaryStatusIdle: summaryStatus.data?.[0]?.idleTime || 0,
                        summaryStatusStop: summaryStatus.data?.[0]?.stopTime || 0,
                        timelineEndTime: lastInterval?.endTime,
                        timelineStartTime: lastInterval?.startTime,
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
            
            const { startTime, endTime , type } = req.query;
            const params = { startTime, endTime , type };
            const getTopTen =await MachineOperationStatusService.getTopTen(params)
            return HttpResponseService.success(res, constants.SUCCESS, getTopTen);

        } catch (error) {
            console.error("Error in getTopTenRunTime:", error);
            return HttpResponseService.internalServerError(res, error);
        }
    },
    async callRpc(req, res) {
        const { deviceId, controlKey, value, index, dates } = req.body;
        const params = { deviceId, controlKey, value };
        console.log(dates);
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