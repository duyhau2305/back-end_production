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
    default: 'Pending'
  },
  employeeName: { 
    type: [String], 
    required: true 
  },
});

// Schema cho ProductionTask
const ProductionTaskSchema = new Schema({
  date: { 
    type: Date, 
    required: true 
  },
  deviceId: { 
    type: String, 
  },
  
  deviceName: { 
    type: String, 
    required: true 
  },
  
  shifts: [TaskShiftSchema] 
}, { timestamps: true });

module.exports = mongoose.model('ProductionTask', ProductionTaskSchema);
