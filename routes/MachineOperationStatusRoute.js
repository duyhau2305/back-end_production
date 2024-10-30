const express = require('express');
const MachineOperationStatusController = require('../controller/MachineOperationStatusController');
const router = express.Router();
router.get('/:machineId/timeline', MachineOperationStatusController.getStatusTimeline);
module.exports = router;