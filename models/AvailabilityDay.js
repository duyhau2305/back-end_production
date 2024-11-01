const mongoose = require('mongoose');

const AvailabilityDaySchema = new mongoose.Schema({
  machineId: { type: String, required: true },
  logTime: { type: String, required: true }, 
  runTime: { type: Number, required: true },
  idleTime :  { type: Number, required: true },
  offlineTime: { type: Number},
  stopTime: { type: Number, required: true },
}, { timestamps: true });
const AvailabilityDay = mongoose.model('AvailabilityDay', AvailabilityDaySchema);
module.exports = AvailabilityDay;