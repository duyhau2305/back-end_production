const mongoose = require('mongoose');

const telemetrySchema = new mongoose.Schema({
  key: String,
  value: mongoose.Mixed,
  ts: Date,
}, { timestamps: true });

const Telemetry = mongoose.model('Telemetry', telemetrySchema);

module.exports = Telemetry;
