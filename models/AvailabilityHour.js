const mongoose = require('mongoose');

const AvailabilityHourSchema = new mongoose.Schema({
  machineId: { type: String, required: true },
  logTime: { type: String, required: true }, 
  runTime: { type: Number, required: true }, 
  idleTime :  { type: Number, required: true },
  offlineTime: { type: Number},
  stopTime: { type: Number, required: true },
}, { timestamps: true });
const AvailabilityHour = mongoose.model('AvailabilityHour', AvailabilityHourSchema);
module.exports = AvailabilityHour;