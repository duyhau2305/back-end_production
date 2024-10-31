const constants = require("../constants/constants");
const HttpResponseService = require("../services/HttpResponseService");
const MachineOperationStatusService = require("../services/MachineOperationStatusService");

module.exports = {
    async getStatusTimeline(req, res) {
        try {
            const machineId = req.params.machineId;
            const {startTime, endTime} = req.query;
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
            const {startTime, endTime} = req.query;
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
    }
}