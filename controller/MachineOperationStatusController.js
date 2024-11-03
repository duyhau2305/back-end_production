const constants = require("../constants/constants");
const Device = require("../models/Device");
const HttpResponseService = require("../services/HttpResponseService");
const MachineOperationStatusService = require("../services/MachineOperationStatusService");

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
            const devices = await Device.find({}, '_id operationStatusKey');
            const filteredData = devices.map(({ _id, operationStatusKey }) => ({ _id, operationStatusKey }));
            return HttpResponseService.success(res, constants.SUCCESS, filteredData);
        } catch (error) {
            return HttpResponseService.internalServerError(res, filteredData);
        }
    },
    async getPercentDiff(req, res) {
        try {
            const { startTime, endTime } = req.query;
            const params = { startTime, endTime };
            const getSummaryStatus = await MachineOperationStatusService.getPercentDiff(params);
    
            if (getSummaryStatus.status !== constants.RESOURCE_SUCCESSFULLY_FETCHED) {
                const errMsg = `No machine found with id = ${machineId}`;
                return getSummaryStatus.status === constants.RESOURCE_NOT_FOUND
                    ? HttpResponseService.notFound(res, errMsg)
                    : HttpResponseService.internalServerError(res, getSummaryStatus);
            }
    
            const groupedData = getSummaryStatus.data.reduce((acc, item) => {
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
    
            return HttpResponseService.success(res, constants.SUCCESS, resultsPercent);
        } catch (error) {
            return HttpResponseService.internalServerError(res, error);
        }
    }
    

}