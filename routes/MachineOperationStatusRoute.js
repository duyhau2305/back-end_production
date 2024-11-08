const express = require('express');
const MachineOperationStatusController = require('../controller/MachineOperationStatusController');
const router = express.Router();
router.get('/:machineId/timeline', MachineOperationStatusController.getStatusTimeline);
router.get('/:machineId/summary-status', MachineOperationStatusController.getSummaryStatus);
router.get('/machineOperations', MachineOperationStatusController.getMachine);
// router.get('/percentDiff', MachineOperationStatusController.getPercentDiff);
router.get('/machine-information', MachineOperationStatusController.getInformationAllMachine);
router.get('/machine-analysis', MachineOperationStatusController.getInformationAnalysis);
// router.post('/call-rpc', MachineOperationStatusController.callRpc);
// router.post('/cancel-rpc', MachineOperationStatusController.cancelScheduledTask);

module.exports = router;