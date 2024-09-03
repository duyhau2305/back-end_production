const express = require('express');
const materialController = require('../controller/materialController');
const router = express.Router();

router.post('/', materialController.createMaterial);
router.get('/', materialController.getAllMaterials);
router.get('/:id', materialController.getMaterialById);
router.put('/:id', materialController.updateMaterial);
router.delete('/:id', materialController.deleteMaterial);

module.exports = router;
