const Company = require('../models/Company');
const User = require('../models/User');
const { ok, ApiError, asyncHandler } = require('../utils/response');
const pick = require('../utils/pick');

// POST /api/companies — recruiter creates (or replaces) their company profile
exports.createCompany = asyncHandler(async (req, res) => {
  const body = pick(req.body, ['name', 'description', 'industry', 'location', 'website']);
  if (!body.name) throw new ApiError(400, 'Company name is required');

  let company = await Company.findOne({ createdBy: req.user._id });
  if (company) {
    Object.assign(company, body);
    await company.save();
  } else {
    company = await Company.create({ ...body, createdBy: req.user._id });
    await User.updateOne({ _id: req.user._id }, { $set: { company: company._id } });
  }
  ok(res, { status: 201, message: 'Company saved', data: company });
});

// GET /api/companies/me
exports.myCompany = asyncHandler(async (req, res) => {
  const company = await Company.findOne({ createdBy: req.user._id });
  ok(res, { data: company });
});

// GET /api/companies/:id
exports.getCompany = asyncHandler(async (req, res) => {
  const company = await Company.findById(req.params.id);
  if (!company) throw new ApiError(404, 'Company not found');
  ok(res, { data: company });
});
