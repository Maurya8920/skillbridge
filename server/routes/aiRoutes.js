const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const {
  generateCoverLetter,
  generateJobDescription,
  matchCandidate,
  rankApplicants,
} = require('../controllers/aiController');

const router = express.Router();

// All AI routes require an authenticated user
router.use(protect);

router.post('/cover-letter', authorize('student'), generateCoverLetter);
router.post('/job-description', authorize('recruiter'), generateJobDescription);
router.post('/match', authorize('student'), matchCandidate);
router.post('/rank-applicants', authorize('recruiter'), rankApplicants);

module.exports = router;
