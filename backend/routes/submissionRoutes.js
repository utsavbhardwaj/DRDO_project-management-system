const express = require('express');
const router = express.Router();
const { createSubmission, getProjectSubmissions } = require('../controllers/submissionController');
const { protect } = require('../middleware/authMiddleware');

router.route('/')
  .post(protect, createSubmission);

router.route('/project/:projectId')
  .get(protect, getProjectSubmissions);

module.exports = router;
