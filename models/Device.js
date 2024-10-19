const mongoose = require('mongoose');
const moment = require('moment');

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: [true, 'ID Thiết Bị là bắt buộc'],
    unique: true,
    trim: true,
  },
  deviceName: {
    type: String,
    required: [true, 'Tên Thiết Bị là bắt buộc'],
    trim: true,
  },
  areaName: {
    type: String,
    required: [true, 'Khu Vực là bắt buộc'],
    trim: true,
  },
  model: {
    type: String,
    required: [true, 'Model là bắt buộc'],
    trim: true,
  },
  technicalSpecifications: {
    type: String,
    trim: true, // Thông số kỹ thuật có thể không bắt buộc, nhưng cần trim để loại bỏ khoảng trắng
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Ngày Mua là bắt buộc'],
  },
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

// Virtual field để định dạng Ngày Mua
deviceSchema.virtual('formattedPurchaseDate').get(function() {
  return moment(this.purchaseDate).format('DD-MM-YYYY');
});

// Cấu hình để bao gồm virtual fields khi chuyển đổi sang JSON hoặc Object
deviceSchema.set('toJSON', { virtuals: true });
deviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Device', deviceSchema);
