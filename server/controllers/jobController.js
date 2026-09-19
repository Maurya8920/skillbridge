const mongoose = require('mongoose');
const Job = require('../models/Job');
const Company = require('../models/Company');
const Application = require('../models/Application');
const { ok, ApiError, asyncHandler } = require('../utils/response');
const pick = require('../utils/pick');

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// GET /api/jobs — public search with filters + pagination (all done in the DB query)
exports.listJobs = asyncHandler(async (req, res) => {
  const { keyword, jobType, workMode, location, minStipend } = req.query;
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 10));

  const filter = { isActive: true };
  if (keyword) {
    const re = new RegExp(escapeRegex(String(keyword)), 'i');
    filter.$or = [{ title: re }, { description: re }, { skills: re }];
  }
  if (jobType) filter.jobType = jobType;
  if (workMode) filter.workMode = workMode;
  if (location) filter.location = new RegExp(escapeRegex(String(location)), 'i');
  if (minStipend) filter.stipend = { $gte: Number(minStipend) || 0 };

  const [total, jobs] = await Promise.all([
    Job.countDocuments(filter),
    Job.find(filter)
      .populate('company', 'name industry location')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
  ]);

  ok(res, {
    data: jobs,
    pagination: { total, page, limit, pages: Math.ceil(total / limit) || 1 },
  });
});

// GET /api/jobs/:id
exports.getJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.id)
    .populate('company', 'name description industry location website')
    .populate('createdBy', 'name');
  if (!job) throw new ApiError(404, 'Job not found');
  ok(res, { data: job });
});

// GET /api/jobs/recruiter/my-jobs — declared before /:id in routes
exports.myJobs = asyncHandler(async (req, res) => {
  const jobs = await Job.find({ createdBy: req.user._id })
    .populate('company', 'name')
    .sort({ createdAt: -1 })
    .lean();

  // One aggregation for all application counts
  const counts = await Application.aggregate([
    { $match: { job: { $in: jobs.map((j) => j._id) } } },
    { $group: { _id: '$job', count: { $sum: 1 } } },
  ]);
  const countMap = Object.fromEntries(counts.map((c) => [c._id.toString(), c.count]));

  ok(res, { data: jobs.map((j) => ({ ...j, applicationCount: countMap[j._id.toString()] || 0 })) });
});

const JOB_FIELDS = ['title', 'description', 'company', 'jobType', 'workMode', 'location', 'skills', 'stipend', 'openings', 'deadline', 'isActive'];

// POST /api/jobs — recruiter; createdBy always from token
exports.createJob = asyncHandler(async (req, res) => {
  const body = pick(req.body, JOB_FIELDS);
  if (typeof body.skills === 'string') body.skills = body.skills.split(',').map((s) => s.trim()).filter(Boolean);

  // Company must belong to this recruiter (or be the recruiter's default company)
  const companyId = body.company || req.user.company;
  if (!companyId) throw new ApiError(400, 'Create a company profile before posting a job');
  if (!mongoose.isValidObjectId(companyId)) throw new ApiError(400, 'Malformed company id');
  const company = await Company.findOne({ _id: companyId, createdBy: req.user._id });
  if (!company) throw new ApiError(403, 'You can only post jobs for your own company');

  const job = await Job.create({ ...body, company: company._id, createdBy: req.user._id });
  ok(res, { status: 201, message: 'Job created', data: job });
});

const loadOwnedJob = async (req) => {
  const job = await Job.findById(req.params.id);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.createdBy.toString() !== req.user._id.toString()) throw new ApiError(403, 'You do not own this job');
  return job;
};

// PUT /api/jobs/:id — recruiter + owner; whitelist updatable fields
exports.updateJob = asyncHandler(async (req, res) => {
  const job = await loadOwnedJob(req);
  const updates = pick(req.body, JOB_FIELDS.filter((f) => f !== 'company'));
  if (typeof updates.skills === 'string') updates.skills = updates.skills.split(',').map((s) => s.trim()).filter(Boolean);
  Object.assign(job, updates);
  await job.save();
  ok(res, { message: 'Job updated', data: job });
});

// DELETE /api/jobs/:id — recruiter + owner
exports.deleteJob = asyncHandler(async (req, res) => {
  const job = await loadOwnedJob(req);
  await Promise.all([job.deleteOne(), Application.deleteMany({ job: job._id })]);
  ok(res, { message: 'Job deleted', data: { id: job._id } });
});
