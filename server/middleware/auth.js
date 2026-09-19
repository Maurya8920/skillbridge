const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { ApiError, asyncHandler } = require('../utils/response');

// Verify JWT and reload the user from the DB on every request
const protect = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) throw new ApiError(401, 'Not authorized, no token');

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    throw new ApiError(401, 'Not authorized, token invalid or expired');
  }

  const user = await User.findById(decoded.id);
  if (!user) throw new ApiError(401, 'Not authorized, user no longer exists');
  if (!user.isActive) throw new ApiError(401, 'Account is disabled');

  req.user = user;
  next();
});

// Role gate — user is identified but may not be allowed
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return next(new ApiError(403, `Role '${req.user?.role}' is not allowed to perform this action`));
  }
  next();
};

module.exports = { protect, authorize };
