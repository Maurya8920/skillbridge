const router = require('express').Router();
const c = require('../controllers/companyController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('recruiter'), c.createCompany);
router.get('/me', protect, authorize('recruiter'), c.myCompany);
router.get('/:id', c.getCompany);

module.exports = router;
