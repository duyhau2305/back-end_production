const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const IssueSchema = new Schema({
  reasonCode: {
    type: String,
    required: [true, 'reasonCode là bắt buộc'], 
    unique: true,  
    minlength: [3, 'reasonCode phải có ít nhất 3 ký tự'], 
    maxlength: [20, 'reasonCode không được vượt quá 20 ký tự'], 
  },
  reasonName: {
    type: String,
    required: [true, 'reasonName là bắt buộc'], 
  },
  deviceNames: {
    type: [String],  
    required: [true, 'deviceNames là bắt buộc'],  
    validate: {
      validator: function(value) {
        return value.length > 0 && value.every(item => typeof item === 'string');
      },
      message: 'deviceNames phải là mảng và chứa các chuỗi hợp lệ',
    }
  },
  deviceStatus: {
    type: String,
    required: [true, 'deviceStatus là bắt buộc'],
       default: 'active'  // Giá trị mặc định là 'active'
  }
});

module.exports = mongoose.model('Issue', IssueSchema);
