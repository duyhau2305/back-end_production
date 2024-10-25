const ProductionTask = require('../models/ProductionTask');

const productionTaskService = {
  async createProductionTask(data) {
    const productionTask = new ProductionTask(data);
    return await productionTask.save();
  },

  async updateProductionTask(id, data) {
    return await ProductionTask.findByIdAndUpdate(id, data, { new: true });
  },

  async deleteProductionTask(id) {
    return await ProductionTask.findByIdAndDelete(id);
  },

  // Hàm hỗ trợ tìm kiếm với deviceName, startDate và endDate
  async getAllProductionTasks(filter = {}) {
    const query = {};

    // Thêm điều kiện tìm kiếm theo deviceName nếu có
    if (filter.deviceName) {
      query.deviceName = new RegExp(`^${filter.deviceName}$`, 'i'); // Không phân biệt hoa thường
    }

    // Thêm điều kiện lọc theo ngày nếu có startDate và endDate
    if (filter.startDate || filter.endDate) {
      query.date = {};
      if (filter.startDate) {
        query.date.$gte = new Date(`${filter.startDate}T00:00:00Z`);
      }
      if (filter.endDate) {
        query.date.$lte = new Date(`${filter.endDate}T23:59:59Z`);
      }
    }

    // Thực hiện truy vấn với các điều kiện lọc
    return await ProductionTask.find(query);
  },

  async getProductionTaskById(id) {
    return await ProductionTask.findById(id);
  },

  async findTaskByDeviceName(deviceName) {
    return await ProductionTask.findOne({ deviceName: new RegExp(`^${deviceName}$`, "i") });
  }
};

module.exports = productionTaskService;
