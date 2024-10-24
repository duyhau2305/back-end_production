const mongoose = require('mongoose');

const AvailabilityDaySchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  date: { type: String, required: true },
  logTime: { type: Date, required: true },
  runtime: { type: String, required: true }, 
  offlineTime: { type: String},
  stopTime: { type: String, required: true },
}, { timestamps: true });
const AvailabilityDay = mongoose.model('AvailabilityDay', AvailabilityDaySchema);
module.exports = AvailabilityDay;