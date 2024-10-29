const mongoose = require('mongoose');

const AvailabilityHourSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  logTime: { type: String, required: true }, 
  runtime: { type: Number, required: true }, 
  offlineTime: { type: Number},
  stopTime: { type: Number, required: true },
}, { timestamps: true });
const AvailabilityHour = mongoose.model('AvailabilityHour', AvailabilityHourSchema);
module.exports = AvailabilityHour;
