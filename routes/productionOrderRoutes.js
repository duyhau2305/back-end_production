const express = require('express');
const {
  getProductionOrders,
  createProductionOrder,
  updateProductionOrder,
  deleteProductionOrder
} = require('../controller/productionOrderController');

const router = express.Router();

// Đường dẫn để lấy tất cả các đơn hàng sản xuất
router.get('/', getProductionOrders);

// Đường dẫn để tạo mới một đơn hàng sản xuất
router.post('/', createProductionOrder);

// Đường dẫn để cập nhật đơn hàng sản xuất
router.put('/:id', updateProductionOrder);

// Đường dẫn để xóa đơn hàng sản xuất
router.delete('/:id', deleteProductionOrder);

module.exports = router;
