const mongoose = require('mongoose');
const Schema = mongoose.Schema;


const TaskShiftSchema = new Schema({
  shiftName: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Pending', 'Active', 'Completed', 'Cancelled'], // Các trạng thái của ca làm việc
    default: 'Pending'
  }
});

// Schema cho ProductionTask
const ProductionTaskSchema = new Schema({
  date: { 
    type: Date, 
    required: true 
  },
  deviceName: { 
    type: String, 
    required: true 
  },
  employeeName: { 
    type: String, 
    required: true 
  },
  shifts: [TaskShiftSchema] 
}, { timestamps: true });

module.exports = mongoose.model('ProductionTask', ProductionTaskSchema);
