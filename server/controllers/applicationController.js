const Job = require('../models/Job');
const Application = require('../models/Application');
const { STATUSES } = require('../models/Application');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// POST /api/applications/:jobId — student
exports.apply = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  if (!job.isActive) throw new ApiError(400, 'This job is no longer accepting applications');
  if (job.deadline && job.deadline < new Date()) throw new ApiError(400, 'Application deadline has passed');

  const existing = await Application.findOne({ job: job._id, applicant: req.user._id });
  if (existing) throw new ApiError(409, 'You have already applied to this job');

  try {
    const application = await Application.create({
      job: job._id,
      applicant: req.user._id,
      coverLetter: req.body.coverLetter,
      resumeSnapshot: req.user.resumeUrl, // frozen copy of resume at apply time
    });
    ok(res, { status: 201, message: 'Application submitted', data: application });
  } catch (err) {
    // Race-condition safety net: unique index fired
    if (err.code === 11000) throw new ApiError(409, 'You have already applied to this job');
    throw err;
  }
});

// GET /api/applications/my — student
exports.myApplications = asyncHandler(async (req, res) => {
  const apps = await Application.find({ applicant: req.user._id })
    .populate({ path: 'job', select: 'title jobType workMode location stipend isActive company', populate: { path: 'company', select: 'name' } })
    .sort({ createdAt: -1 });
  ok(res, { data: apps });
});

// GET /api/applications/job/:jobId — owning recruiter only
exports.applicantsForJob = asyncHandler(async (req, res) => {
  const job = await Job.findById(req.params.jobId).select('createdBy title');
  if (!job) throw new ApiError(404, 'Job not found');
  // Ownership check BEFORE any applicant data is read
  if (job.createdBy.toString() !== req.user._id.toString()) throw new ApiError(403, 'You do not own this job');

  const filter = { job: job._id };
  if (req.query.status && STATUSES.includes(req.query.status)) filter.status = req.query.status;

  const apps = await Application.find(filter)
    .populate('applicant', 'name email phone location education skills resumeUrl')
    .sort({ createdAt: -1 });
  ok(res, { data: { job: { _id: job._id, title: job.title }, applications: apps } });
});

// PATCH /api/applications/:id/status — owning recruiter only
exports.updateStatus = asyncHandler(async (req, res) => {
  const { status, note } = req.body;
  const allowed = STATUSES.filter((s) => s !== 'withdrawn');
  if (!allowed.includes(status)) throw new ApiError(400, `status must be one of: ${allowed.join(', ')}`);

  const app = await Application.findById(req.params.id).populate('job', 'createdBy');
  if (!app) throw new ApiError(404, 'Application not found');
  if (app.job.createdBy.toString() !== req.user._id.toString()) throw new ApiError(403, 'You do not own this job');
  if (app.status === 'withdrawn') throw new ApiError(400, 'Applicant has withdrawn this application');

  app.status = status;
  if (note !== undefined) app.note = note;
  await app.save();
  ok(res, { message: 'Status updated', data: app });
});

// PATCH /api/applications/:id/withdraw — applicant only
exports.withdraw = asyncHandler(async (req, res) => {
  const app = await Application.findById(req.params.id);
  if (!app) throw new ApiError(404, 'Application not found');
  if (app.applicant.toString() !== req.user._id.toString()) throw new ApiError(403, 'This is not your application');
  if (['selected', 'rejected'].includes(app.status)) throw new ApiError(400, `Cannot withdraw a ${app.status} application`);

  app.status = 'withdrawn';
  await app.save();
  ok(res, { message: 'Application withdrawn', data: app });
});
