// controllers/IssueController.js
const issueService = require('../services/IssueService');

async function createIssue(req, res) {
  try {
    // Dữ liệu từ frontend sẽ chứa `deviceNames` là một mảng
    console.log("Request body:", req.body); 
    const issue = await issueService.createIssue(req.body);
    res.status(201).json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function getAllIssues(req, res) {
  try {
    const issues = await issueService.getAllIssues();
    res.status(200).json(issues);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

async function updateIssue(req, res) {
  try {
    // Cập nhật issue theo ID với `deviceNames` là mảng từ frontend
    const issue = await issueService.updateIssue(req.params.id, req.body);
    res.status(200).json(issue);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
}

async function deleteIssue(req, res) {
  try {
    const issue = await issueService.deleteIssue(req.params.id);
    res.status(200).json({ message: 'Xóa nguyên nhân dừng máy thành công', issue });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

module.exports = {
  createIssue,
  getAllIssues,
  updateIssue,
  deleteIssue,
};
