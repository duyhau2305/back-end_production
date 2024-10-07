// routes/issueRoutes.js
const express = require('express');
const router = express.Router();
const issueController = require('..//controller/IssueController');

// Create new Issue
router.post('/', issueController.createIssue);


router.get('/', issueController.getAllIssues);


router.put('/:id', issueController.updateIssue);


router.delete('/:id', issueController.deleteIssue);

module.exports = router;
