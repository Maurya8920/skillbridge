const router = require('express').Router();
const { uploadResume } = require('../controllers/uploadController');
const { uploadResume: multerResume } = require('../middleware/upload');
const { protect, authorize } = require('../middleware/auth');

router.post('/resume', protect, authorize('student'), multerResume, uploadResume);

module.exports = router;
