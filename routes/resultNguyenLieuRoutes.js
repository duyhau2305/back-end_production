// routes/resultNguyenLieuRoutes.js
const express = require('express');
const router = express.Router();
const resultNguyenLieuController = require('../controller/resultNguyenLieuController');

// Định nghĩa các route và liên kết với controller
router.post('/', resultNguyenLieuController.createResult);
router.get('/', resultNguyenLieuController.getAllResults);
router.get('/:id', resultNguyenLieuController.getResultById);
router.put('/:id', resultNguyenLieuController.updateResult);
router.delete('/:id', resultNguyenLieuController.deleteResult);

module.exports = router;
