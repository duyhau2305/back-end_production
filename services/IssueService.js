// services/IssueService.js
const Issue = require('../models/Issue');
const Device = require('../models/Device');

async function createIssue(data) {
  try {
 
    if (!Array.isArray(data.deviceNames)) {
      throw new Error('deviceNames phải là một mảng');
    }

    if (!data.deviceNames.every(deviceName => typeof deviceName === 'string')) {
      throw new Error('Tất cả các phần tử trong deviceNames phải là chuỗi');
    }

    const devices = await Device.find({ deviceName: { $in: data.deviceNames } });

    if (devices.length !== data.deviceNames.length) {
      throw new Error('Một hoặc nhiều thiết bị không tồn tại.');
    }

 
    const issue = new Issue({
      reasonCode: data.reasonCode,
      reasonName: data.reasonName,
      deviceNames: data.deviceNames, 
    });

    
    const savedIssue = await issue.save();

    
    console.log("Issue saved:", savedIssue);

    return savedIssue;
  } catch (error) {
    console.error("Error while saving issue:", error.message);

   
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      throw new Error(`Validation failed: ${messages.join(', ')}`);
    }

    throw error;
  }
}


async function getAllIssues() {
  return await Issue.find();
}


async function updateIssue(id, data) {
  if (!Array.isArray(data.deviceNames)) {
    throw new Error('deviceNames phải là một mảng');
  }

  const issue = await Issue.findById(id);
  if (!issue) {
    throw new Error('Nguyên nhân dừng máy không tồn tại.');
  }

  
  for (let deviceName of data.deviceNames) {
    const device = await Device.findOne({ deviceName });
    if (!device) {
      throw new Error(`Thiết bị với tên ${deviceName} không tồn tại.`);
    }
  }

  return await Issue.findByIdAndUpdate(id, data, { new: true });
}


async function deleteIssue(id) {
  const issue = await Issue.findById(id);
  if (!issue) {
    throw new Error('Nguyên nhân dừng máy không tồn tại.');
  }
  await Issue.findByIdAndDelete(id);
  return issue;
}

module.exports = {
  createIssue,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
