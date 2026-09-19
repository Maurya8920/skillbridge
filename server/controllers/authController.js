const User = require('../models/User');
const { ok, ApiError, asyncHandler } = require('../utils/response');
const { signToken } = require('../utils/token');
const pick = require('../utils/pick');

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw new ApiError(400, 'name, email and password are required');
  // Only student or recruiter can self-register; admin is seeded
  const safeRole = role === 'recruiter' ? 'recruiter' : 'student';

  const exists = await User.findOne({ email: String(email).toLowerCase() });
  if (exists) throw new ApiError(409, 'Email already registered');

  const user = await User.create({ name, email, password, role: safeRole });
  ok(res, {
    status: 201,
    message: 'Registered successfully',
    data: { token: signToken(user), user: user.toSafeObject() },
  });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw new ApiError(400, 'email and password are required');

  const user = await User.findOne({ email: String(email).toLowerCase() }).select('+password');
  // Identical error for unknown email and wrong password
  if (!user || !(await user.matchPassword(password))) throw new ApiError(401, 'Invalid credentials');
  if (!user.isActive) throw new ApiError(401, 'Account is disabled');

  ok(res, { message: 'Logged in', data: { token: signToken(user), user: user.toSafeObject() } });
});

// GET /api/auth/me
exports.me = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate('company', 'name industry location');
  ok(res, { data: user.toSafeObject() });
});

// PUT /api/auth/profile — role, email, password, isActive are NOT editable here
exports.updateProfile = asyncHandler(async (req, res) => {
  const updates = pick(req.body, ['name', 'phone', 'location', 'bio', 'education', 'skills']);
  if (updates.skills && !Array.isArray(updates.skills)) {
    updates.skills = String(updates.skills).split(',').map((s) => s.trim()).filter(Boolean);
  }
  const user = await User.findById(req.user._id);
  Object.assign(user, updates);
  await user.save();
  ok(res, { message: 'Profile updated', data: user.toSafeObject() });
});
