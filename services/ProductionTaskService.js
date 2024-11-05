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
    const query = {};
    console.log(filter)
    if (filter.deviceName) {
      query.deviceName = new RegExp(`^${filter.deviceName}$`, 'i'); 
    }
    if (filter.startDate || filter.endDate) {
      query.date = {};
      
    }
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
