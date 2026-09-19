const router = require('express').Router();
const c = require('../controllers/applicationController');
const { protect, authorize } = require('../middleware/auth');

router.get('/my', protect, authorize('student'), c.myApplications);
router.get('/job/:jobId', protect, authorize('recruiter'), c.applicantsForJob);
router.post('/:jobId', protect, authorize('student'), c.apply);
router.patch('/:id/status', protect, authorize('recruiter'), c.updateStatus);
router.patch('/:id/withdraw', protect, authorize('student'), c.withdraw);

module.exports = router;
