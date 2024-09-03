const express = require('express');
const router = express.Router();
const chemicalEntryController = require('../controller/chemicalEntryController');


router.get('/', chemicalEntryController.getChemicalEntries);
router.get('/:id', chemicalEntryController.getChemicalEntry);
router.post('/', chemicalEntryController.createChemicalEntry);
router.put('/:id', chemicalEntryController.updateChemicalEntry);
router.delete('/:id', chemicalEntryController.deleteChemicalEntry);

module.exports = router;
