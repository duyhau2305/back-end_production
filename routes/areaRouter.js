
const express = require('express');
const areaController = require('../controller/AreaController');
const router = express.Router();

// Create a new area
router.post('/', areaController.createArea);


router.get('/', areaController.getAllAreas);


router.get('/:id', areaController.getAreaById);


router.put('/:id', areaController.updateArea);


router.delete('/:id', areaController.deleteArea);

module.exports = router;
