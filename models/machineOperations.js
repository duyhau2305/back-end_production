const mongoose = require('mongoose');
const moment = require('moment');

const MachineOperations = new mongoose.Schema({
  deviceId: { type: String, required: true },
  date: { type: String, required: true },
  startTime : { type: String, required: true },
  endTime : { type: String, required: true },
  status : { type: String, required: true },
  durationInMinutes : { type: Number, required: true },
}, { timestamps: true });
module.exports = mongoose.model('MachineOperations', MachineOperations);