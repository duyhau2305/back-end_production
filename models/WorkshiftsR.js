// models/WorkShift.js
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const BreakTimeSchema = new Schema({
  startTime: {
    type: String,
    required: true,
  },
  endTime: {
    type: String,
    required: true,
  }
});

const WorkShiftRealSchema = new Schema({
   deviceId: {
        type: String,
      },
    name: {
    type: String,
    required: [true, 'Tên Ca Làm Việc là bắt buộc']
  },
  workshiftcode: {
    type: String,
    required: [true, 'Code Ca là bắt buộc'],
    match: [/^\d{2}:\d{2}$/, 'Thời gian bắt đầu phải ở định dạng HH:mm']
  },
  entryTime: {
    type: String,
    required: [true, 'Thời Gian Bắt Đầu là bắt buộc'],
    match: [/^\d{2}:\d{2}$/, 'Thời gian bắt đầu phải ở định dạng HH:mm']
  },
  exitedTime: {
    type: String,
    required: [true, 'Thời Gian Kết Thúc là bắt buộc'],
    match: [/^\d{2}:\d{2}$/, 'Thời gian kết thúc phải ở định dạng HH:mm']
  },
  breakTime: [BreakTimeSchema]
}, { timestamps: true });

module.exports = mongoose.model('WorkshiftReal', WorkShiftRealSchema);