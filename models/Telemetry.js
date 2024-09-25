// models/Telemetry.js

const mongoose = require('mongoose');

const TelemetrySchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Telemetry', TelemetrySchema);
