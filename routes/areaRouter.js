
const express = require('express');
const areaController = require('../controller/AreaController');
const router = express.Router();

// Create a new area
router.post('/', areaController.createArea);

// Get all areas
router.get('/', areaController.getAllAreas);

// Get area by ID
router.get('/:id', areaController.getAreaById);

// Update an area by ID
router.put('/:id', areaController.updateArea);

// Delete an area by ID
router.delete('/:id', areaController.deleteArea);

module.exports = router;
