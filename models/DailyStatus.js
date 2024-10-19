const mongoose = require('mongoose');
const moment = require('moment');
const DailySummaryService = require('../services/DailySummaryService');

const dailyStatusSchema = new mongoose.Schema({
  deviceId: { type: String, required: true },
  date: { type: String, required: true },
  intervals: [
    {
      status: { type: String, enum: ['Chạy', 'Dừng'], required: true },
      startTime: { type: String, required: true },
      endTime: { type: String, required: true },
    },
  ],
}, { timestamps: true });

// Middleware để tự động tạo DailySummary khi DailyStatus được lưu
dailyStatusSchema.post('save', async function(doc) {
  try {
    const deviceId = doc.deviceId;
    const date = doc.date;

    // Gọi hàm tạo DailySummary
    await DailySummaryService.generateDailySummary(deviceId, date);
  } catch (error) {
    console.error('Lỗi khi tạo DailySummary:', error);
  }
});

module.exports = mongoose.model('DailyStatus', dailyStatusSchema);
