const mongoose = require('mongoose');

const JOB_TYPES = ['internship', 'full-time', 'part-time', 'contract'];
const WORK_MODES = ['remote', 'onsite', 'hybrid'];

const jobSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Title is required'], trim: true, maxlength: 120 },
    description: { type: String, required: [true, 'Description is required'], maxlength: 5000 },
    company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    jobType: { type: String, enum: JOB_TYPES, required: true },
    workMode: { type: String, enum: WORK_MODES, required: true },
    location: { type: String, trim: true, default: '' },
    skills: { type: [{ type: String, lowercase: true, trim: true }], default: [] },
    stipend: { type: Number, min: 0, default: 0 },
    openings: { type: Number, min: 1, default: 1 },
    deadline: { type: Date },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Indexes for search and filtering
jobSchema.index({ title: 'text', description: 'text' });
jobSchema.index({ jobType: 1, workMode: 1, isActive: 1 });
jobSchema.index({ location: 1 });
jobSchema.index({ skills: 1 });
jobSchema.index({ stipend: 1 });
jobSchema.index({ createdBy: 1 });
jobSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Job', jobSchema);
module.exports.JOB_TYPES = JOB_TYPES;
module.exports.WORK_MODES = WORK_MODES;
