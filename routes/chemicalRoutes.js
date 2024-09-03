// routes/chemicalRoutes.js
const express = require('express');
const router = express.Router();
const chemicalController = require('../controller/chemicalController');


router.get('/', chemicalController.getChemicals);
router.get('/:id',  chemicalController.getChemicalById);
router.post('/',  chemicalController.createChemical);
router.put('/:id', chemicalController.updateChemical);
router.delete('/:id',   chemicalController.deleteChemical);

module.exports = router;
