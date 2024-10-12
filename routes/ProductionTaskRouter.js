const express = require('express');
const router = express.Router();
const productionTaskController = require('../controller/ProductionTaskController');

// Các route cho nhiệm vụ sản xuất
router.get('/', productionTaskController.getAllProductionTasks);
router.get('/:id', productionTaskController.getProductionTaskById);
router.post('/', productionTaskController.createProductionTask);
router.put('/:id', productionTaskController.updateProductionTask);
router.delete('/:id', productionTaskController.deleteProductionTask);

module.exports = router;
