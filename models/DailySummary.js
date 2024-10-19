const mongoose = require('mongoose');

const dailySummarySchema = new mongoose.Schema({
  deviceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Device',
    required: true,
  },
  date: { type: String, required: true },
  downtimeIntervals: [
    {
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
      duration: { type: Number, required: true }, // Thời gian dừng (phút)
    },
  ],
  totalRunTime: { type: Number, required: true }, // Tổng thời gian chạy (phút)
  totalDownTime: { type: Number, required: true }, // Tổng thời gian dừng (phút)
  totalOfflineTime: { type: Number, required: true }, // Tổng thời gian offline (phút)
  runPercentage: { type: Number, required: true }, // % chạy / 24h
  downPercentage: { type: Number, required: true }, // % dừng / 24h
  offlinePercentage: { type: Number, required: true }, // % offline / 24h
}, { timestamps: true });

const DailySummary = mongoose.model('DailySummary', dailySummarySchema);
module.exports = DailySummary;
