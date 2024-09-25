const mongoose = require('mongoose');

const StatusSchema = new mongoose.Schema({
    deviceId: {
        type: String,
        required: true,
    },
    statuses: [
        {
            ts: {
                type: Number,
                required: true,
            },
            value: {
                type: String,
                required: true,
            },
        },
    ],
});

const DeviceStatus = mongoose.model('DeviceStatus', StatusSchema);
module.exports = DeviceStatus;
