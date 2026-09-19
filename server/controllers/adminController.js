const User = require('../models/User');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// GET /api/admin/users — never returns passwords
exports.listUsers = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 20));
  const filter = {};
  if (req.query.role) filter.role = req.query.role;

  const [total, users] = await Promise.all([
    User.countDocuments(filter),
    User.find(filter).select('-password').sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
  ]);
  ok(res, { data: users, pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 } });
});

// PATCH /api/admin/users/:id/status — enable / disable
exports.setUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') throw new ApiError(400, 'isActive (boolean) is required');
  if (req.params.id === req.user._id.toString()) throw new ApiError(400, 'You cannot change your own status');

  const user = await User.findById(req.params.id);
  if (!user) throw new ApiError(404, 'User not found');
  user.isActive = isActive;
  await user.save();
  ok(res, { message: `User ${isActive ? 'enabled' : 'disabled'}`, data: user.toSafeObject() });
});

// GET /api/admin/jobs — all jobs incl. inactive
exports.listJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find().populate('company', 'name').populate('createdBy', 'name email').sort({ createdAt: -1 });
  ok(res, { data: jobs });
});

// DELETE /api/admin/jobs/:id — admin can remove any job
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  await Promise.all([job.deleteOne(), Application.deleteMany({ job: job._id })]);
  ok(res, { message: 'Job removed', data: { id: job._id } });
});

// GET /api/admin/stats — counts only
exports.stats = asyncHandler(async (req, res) => {
  const [students, recruiters, companies, jobs, activeJobs, applications, byStatus] = await Promise.all([
    User.countDocuments({ role: 'student' }),
    User.countDocuments({ role: 'recruiter' }),
    Company.countDocuments(),
    Job.countDocuments(),
    Job.countDocuments({ isActive: true }),
    Application.countDocuments(),
    Application.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
  ]);
  ok(res, {
    data: {
      students,
      recruiters,
      companies,
      jobs,
      activeJobs,
      applications,
      applicationsByStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
    },
  });
});
