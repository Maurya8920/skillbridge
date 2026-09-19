const router = require('express').Router();
const c = require('../controllers/jobController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', c.listJobs);
// Must be declared BEFORE /:id so "recruiter" is not parsed as an id
router.get('/recruiter/my-jobs', protect, authorize('recruiter'), c.myJobs);
router.get('/:id', c.getJob);
router.post('/', protect, authorize('recruiter'), c.createJob);
router.put('/:id', protect, authorize('recruiter'), c.updateJob);
router.delete('/:id', protect, authorize('recruiter'), c.deleteJob);

module.exports = router;
