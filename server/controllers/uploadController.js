const fs = require('fs');
const path = require('path');
const User = require('../models/User');
const { ok, ApiError, asyncHandler } = require('../utils/response');
const { uploadDir } = require('../middleware/upload');

// POST /api/upload/resume — student
exports.uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) throw new ApiError(400, 'No file uploaded (field name: resume)');

  // Remove the previous resume file if it exists
  if (req.user.resumeUrl) {
    const old = path.join(uploadDir, path.basename(req.user.resumeUrl));
    fs.promises.unlink(old).catch(() => {});
  }

  const resumeUrl = `/uploads/${req.file.filename}`;
  await User.updateOne({ _id: req.user._id }, { $set: { resumeUrl } });
  ok(res, { message: 'Resume uploaded', data: { resumeUrl } });
});
