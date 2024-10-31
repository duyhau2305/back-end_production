const mongoose = require('mongoose');

const AvailabilityRealtimeSchema = new mongoose.Schema({
  machineId: { type: String, required: true },
  logTime: { type: String, required: true }, 
  runtime: { type: Number, required: true }, 
  offlineTime: { type: Number},
  stopTime: { type: Number, required: true },
}, { timestamps: true });
const AvailabilityRealtime = mongoose.model('AvailabilityRealtime', AvailabilityRealtimeSchema);
module.exports = AvailabilityRealtime;