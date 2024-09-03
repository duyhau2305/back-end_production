const express = require('express');
const router = express.Router();
const exportChemicalController = require('../controller/exportChemicalController');

// Get all export chemicals
router.get('/', exportChemicalController.getExportChemicals);

// Create a new export chemical
router.post('/', exportChemicalController.createExportChemical);

// Update an export chemical
router.put('/:id', exportChemicalController.updateExportChemical);

// Delete an export chemical
router.delete('/:id', exportChemicalController.deleteExportChemical);

module.exports = router;
