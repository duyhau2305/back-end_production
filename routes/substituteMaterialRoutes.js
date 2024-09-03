// routes/substituteMaterialRoutes.js
const express = require ('express');
const router = express.Router();
const substituteMaterialController = require('../controller/substituteMaterialController');

router.get('/', substituteMaterialController.getAllSubstituteMaterials);
router.get('/:id', substituteMaterialController.getSubstituteMaterialById);
router.post('/', substituteMaterialController.createSubstituteMaterial);
router.put('/:id', substituteMaterialController.updateSubstituteMaterial);
router.delete('/:id', substituteMaterialController.deleteSubstituteMaterial);

module.exports = router;
