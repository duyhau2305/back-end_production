// routes/workShiftRoutes.js
const express = require('express');
const router = express.Router();
const workShiftController = require('../controller/WorkShiftController');

router.get('/', workShiftController.getAllWorkShifts);

router.get('/:id', workShiftController.getWorkShiftById);

router.post('/', workShiftController.createWorkShift);

router.put('/:id', workShiftController.updateWorkShift);

router.delete('/:id', workShiftController.deleteWorkShift);

module.exports = router;
