const mongoose = require('mongoose');

const AvailabilityRealtimeSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  date: { type: String, required: true },
  logTime: { type: Date, required: true },
  runtime: { type: String, required: true }, 
  offlineTime: { type: String},
  stopTime: { type: String, required: true },
}, { timestamps: true });
const AvailabilityRealtime = mongoose.model('AvailabilityRealtime', AvailabilityRealtimeSchema);
module.exports = AvailabilityRealtime;
 