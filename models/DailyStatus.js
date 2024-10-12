const mongoose = require('mongoose');

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

const DailyStatus = mongoose.model('DailyStatus', dailyStatusSchema);

module.exports = DailyStatus;
