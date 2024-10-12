const ProductionTask = require('../models/ProductionTask');

class ProductionTaskService {

  async createProductionTask(data) {
    const task = new ProductionTask(data);
    return await task.save();
  }

  
  async updateProductionTask(id, data) {
    return await ProductionTask.findByIdAndUpdate(id, data, { new: true });
  }

  
  async deleteProductionTask(id) {
    return await ProductionTask.findByIdAndDelete(id);
  }

  
  async getAllProductionTasks() {
    return await ProductionTask.find();
  }

  
  async getProductionTaskById(id) {
    return await ProductionTask.findById(id);
  }
}

module.exports = new ProductionTaskService();
