const mongoose = require('mongoose');

const areaSchema = new mongoose.Schema({
  areaCode: {
    type: String,
    required: true,
    unique: true,
  },
  areaName: {
    type: String,
    required: true,
  }
});

const Area = mongoose.model('Area', areaSchema);

module.exports = Area;
