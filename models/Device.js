// models/Device.js
const mongoose = require('mongoose');
const moment = require('moment'); 

const deviceSchema = new mongoose.Schema({
  deviceCode: {
    type: String,
    required: [true, 'Mã Thiết Bị là bắt buộc'],
    unique: true,
    trim: true
  },
  deviceName: {
    type: String,
    required: [true, 'Tên Thiết Bị là bắt buộc'],
    trim: true
  },
  areaName: {
    type: String,
    required: [true, 'Khu Vực là bắt buộc'], 
    trim: true
  },
  model: {
    type: String,
    required: [true, 'Model là bắt buộc'],
    trim: true
  },
  technicalSpecifications: {
    type: String,
    trim: true
  },
  purchaseDate: {
    type: Date,
    required: [true, 'Ngày Mua là bắt buộc']
  }
}, {
  timestamps: true
});


deviceSchema.virtual('formattedPurchaseDate').get(function() {
  return moment(this.purchaseDate).format('DD-MM-YYYY');
});


deviceSchema.set('toJSON', { virtuals: true });
deviceSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Device', deviceSchema);
