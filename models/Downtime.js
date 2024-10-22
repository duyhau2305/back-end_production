const mongoose = require('mongoose');

const downtimeSchema = new mongoose.Schema({
  deviceID: { type: String, required: true },
  deviceName: { type: String, required: true },
  date: { type: Date, required: true },
  interval: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true }
    }
  ],
  reasonName: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Downtime', downtimeSchema);
