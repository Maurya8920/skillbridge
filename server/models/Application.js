const mongoose = require('mongoose');

const STATUSES = ['applied', 'under_review', 'shortlisted', 'selected', 'rejected', 'withdrawn'];

const applicationSchema = new mongoose.Schema(
  {
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    applicant: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    status: { type: String, enum: STATUSES, default: 'applied' },
    coverLetter: { type: String, maxlength: 3000 },
    resumeSnapshot: { type: String },
    note: { type: String, maxlength: 1000 },
  },
  { timestamps: true }
);

// One application per student per job
applicationSchema.index({ job: 1, applicant: 1 }, { unique: true });

module.exports = mongoose.model('Application', applicationSchema);
module.exports.STATUSES = STATUSES;
