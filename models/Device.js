const mongoose = require('mongoose');

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
    trim: true, 
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Ngày Mua là bắt buộc'],
  },
  tbDeviceId: {
    type: String
  },
  operationStatusKey: {
    type: String,
    default: function () {
      return this.deviceName ? `${this.deviceName}_Status` : 'default_status';
    }
  },
  controlKey: {
    type: String,
    default: function () {
      return this.deviceName ? `${this.deviceName}_Control` : 'default_control';
    }
  }
}, {
  timestamps: true, // Tự động thêm createdAt và updatedAt
});

module.exports = mongoose.model('Device', deviceSchema);
