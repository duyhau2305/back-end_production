const constants = require("../constants/constants");
const HttpResponseService = require("../services/HttpResponseService");
const MachineOperationStatusService = require("../services/MachineOperationStatusService");

module.exports = {
    async getStatusTimeline(req, res, next) {
        try {
            const machineId = req.params.machineId;
            const {startTime, endTime} = req.query;
            const params = {
                machineId: machineId,
                startTs: new Date(startTime).getTime(),
                endTs: new Date(endTime).getTime()
            }
            const data = await MachineOperationStatusService.getStatusTimeline(params);
            return HttpResponseService.success(res, constants.SUCCESS, data);
        } catch (error) {
            next(error);
        }
    }
}