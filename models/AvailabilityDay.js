const mongoose = require('mongoose');

const AvailabilityDaySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  logTime: { type: String, required: true }, 
  runtime: { type: Number, required: true }, 
  offlineTime: { type: Number},
  stopTime: { type: Number, required: true },
}, { timestamps: true });
const AvailabilityDay = mongoose.model('AvailabilityDay', AvailabilityDaySchema);
module.exports = AvailabilityDay;