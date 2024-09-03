const express = require('express');
const router = express.Router();
const inspectionSheetController = require('../controller/inspectionSheetController');
const multer = require('multer');

const upload = multer({ dest: 'uploads/' }); // Tạo multer instance cho việc upload file

router.get('/', inspectionSheetController.getAllInspectionSheets);
router.get('/:id', inspectionSheetController.getInspectionSheetById);
router.post('/', upload.single('file'), inspectionSheetController.createInspectionSheet);
router.put('/:id', upload.single('file'), inspectionSheetController.updateInspectionSheet);
router.delete('/:id', inspectionSheetController.deleteInspectionSheet);

module.exports = router;
