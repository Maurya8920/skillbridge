const router = require('express').Router();
const c = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect, authorize('admin'));

router.get('/users', c.listUsers);
router.patch('/users/:id/status', c.setUserStatus);
router.get('/jobs', c.listJobs);
router.delete('/jobs/:id', c.deleteJob);
router.get('/stats', c.stats);

module.exports = router;
