// Single response envelope used by every endpoint
const ok = (res, { status = 200, message = 'OK', data = null, pagination } = {}) => {
  const body = { success: true, message, data };
  if (pagination) body.pagination = pagination;
  return res.status(status).json(body);
};

class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// Wrap async controllers so thrown errors reach the central error handler
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

module.exports = { ok, ApiError, asyncHandler };
