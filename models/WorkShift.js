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

const WorkShiftSchema = new Schema({
  shiftCode: {
    type: String,
    required: [true, 'Mã Ca Làm Việc là bắt buộc'],
    unique: true
  },
  shiftName: {
    type: String,
    required: [true, 'Tên Ca Làm Việc là bắt buộc']
  },
  startTime: {
    type: String,
    required: [true, 'Thời Gian Bắt Đầu là bắt buộc'],
    match: [/^\d{2}:\d{2}$/, 'Thời gian bắt đầu phải ở định dạng HH:mm']
  },
  endTime: {
    type: String,
    required: [true, 'Thời Gian Kết Thúc là bắt buộc'],
    match: [/^\d{2}:\d{2}$/, 'Thời gian kết thúc phải ở định dạng HH:mm']
  },
  breakTime: [BreakTimeSchema]
}, { timestamps: true });

module.exports = mongoose.model('WorkShift', WorkShiftSchema);
