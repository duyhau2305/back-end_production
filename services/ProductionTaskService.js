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

  async getAllProductionTasks(filter = {}) {
    return await ProductionTask.find(filter);
  },

  async getProductionTaskById(id) {
    return await ProductionTask.findById(id);
  },

  async findTaskByDeviceName(deviceName) {
    return await ProductionTask.findOne({ deviceName: new RegExp(`^${deviceName}$`, "i") });
  },
  async findTaskByDeviceAndDate(deviceId, date) {
    return await ProductionTask.findOne({ deviceId, date });
  }
};


module.exports = productionTaskService;
