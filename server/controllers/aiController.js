const mongoose = require('mongoose');
const Job = require('../models/Job');
const Application = require('../models/Application');
const ai = require('../services/ai');
const { ok, ApiError, asyncHandler } = require('../utils/response');

// Helper to check valid Mongo ObjectId
const validateJobId = (jobId) => {
  if (!jobId) throw new ApiError(400, 'jobId is required');
  if (!mongoose.isValidObjectId(jobId)) throw new ApiError(400, 'Malformed job id');
};

// POST /api/ai/cover-letter (student)
exports.generateCoverLetter = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  validateJobId(jobId);

  const job = await Job.findById(jobId).populate('company', 'name');
  if (!job) throw new ApiError(404, 'Job not found');

  const student = req.user;
  const prompt = `Write a professional, compelling cover letter (strictly 150-200 words) in the first person for a student applying to a job.
Rules:
- Length: strictly between 150 and 200 words.
- Tone: professional, confident, proactive.
- Perspective: First person ("I", "my").
- Do NOT include any placeholders like [Company Name], [Your Name], [Date], or bracketed text. Use the actual details provided.
- Return ONLY the cover letter body text without headers, subject line, or sign-offs like "Sincerely".

Student Profile:
- Name: ${student.name || 'Candidate'}
- Education: ${student.education || 'Current Student'}
- Skills: ${(student.skills || []).join(', ') || 'Not specified'}
- Bio: ${student.bio || 'Not specified'}

Job Details:
- Role Title: ${job.title}
- Company: ${job.company?.name || 'the company'}
- Job Type: ${job.jobType}
- Work Mode: ${job.workMode}
- Description: ${job.description}
- Required Skills: ${(job.skills || []).join(', ') || 'General'}`;

  const coverLetter = await ai.generate(prompt, { json: false, userId: req.user._id });
  ok(res, { data: { coverLetter } });
});

// POST /api/ai/job-description (recruiter)
exports.generateJobDescription = asyncHandler(async (req, res) => {
  const { title, keywords, jobType = 'internship', workMode = 'remote' } = req.body;
  if (!title || typeof title !== 'string' || title.trim().length < 3) {
    throw new ApiError(400, 'Title is required and must be at least 3 characters');
  }

  const prompt = `Generate a compelling, professional job description and required technical/professional skills for a job posting.
Job Title: ${title.trim()}
Focus Keywords / Context: ${keywords || 'None specified'}
Job Type: ${jobType}
Work Mode: ${workMode}

Return a JSON object matching this schema:
{
  "description": "120-180 words formatted in plain paragraphs without markdown headings, asterisks, or bullet points",
  "skills": ["skill1", "skill2", "skill3", "skill4", "skill5", "skill6"]
}

Strict requirements:
- "description": exactly 120-180 words, clean plain paragraphs describing role mission, day-to-day impact, and qualifications.
- "skills": an array of 5 to 8 lowercase skill strings (e.g. ["react", "node.js", "typescript", "mongodb", "rest apis"]).
- Output valid JSON only.`;

  const result = await ai.generate(prompt, { json: true, userId: req.user._id });
  const description = String(result?.description || '').trim();
  const rawSkills = Array.isArray(result?.skills) ? result.skills : [];
  const skills = rawSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean).slice(0, 8);

  ok(res, { data: { description, skills } });
});

// POST /api/ai/match (student)
exports.matchCandidate = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  validateJobId(jobId);

  const job = await Job.findById(jobId).populate('company', 'name');
  if (!job) throw new ApiError(404, 'Job not found');

  const student = req.user;
  const prompt = `Compare this student candidate against the job requirements and calculate an objective match evaluation.
Job Posting:
- Title: ${job.title}
- Required Skills: ${(job.skills || []).join(', ') || 'Not specified'}
- Description: ${job.description}

Student Candidate:
- Skills: ${(student.skills || []).join(', ') || 'None listed'}
- Education: ${student.education || 'Not specified'}
- Bio: ${student.bio || 'Not specified'}

Return a JSON object with this exact structure:
{
  "score": <integer from 0 to 100>,
  "reasons": [
    "<short concise sentence explaining fit, 10-20 words>",
    "<short concise sentence on strengths or alignment, 10-20 words>"
  ],
  "missingSkills": [
    "<lowercase skill string required or strongly implied by the job that candidate lacks>"
  ]
}

Rules:
- "score": integer between 0 and 100.
- "reasons": array of 2 to 3 short strings.
- "missingSkills": array of lowercase strings representing skills candidate does not have.
- Output valid JSON only.`;

  const result = await ai.generate(prompt, { json: true, userId: req.user._id });
  const score = Math.max(0, Math.min(100, Math.round(Number(result?.score) || 0)));
  const reasons = Array.isArray(result?.reasons) ? result.reasons.map((r) => String(r).trim()).filter(Boolean).slice(0, 3) : [];
  const missingSkills = Array.isArray(result?.missingSkills) ? result.missingSkills.map((s) => String(s).toLowerCase().trim()).filter(Boolean) : [];

  ok(res, { data: { score, reasons, missingSkills } });
});

// POST /api/ai/rank-applicants (recruiter, must own the job)
exports.rankApplicants = asyncHandler(async (req, res) => {
  const { jobId } = req.body;
  validateJobId(jobId);

  const job = await Job.findById(jobId);
  if (!job) throw new ApiError(404, 'Job not found');
  if (job.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, 'You do not own this job');
  }

  // Load applications for this job up to 30
  const applications = await Application.find({ job: job._id })
    .populate('applicant', 'name email skills education bio')
    .limit(30)
    .lean();

  if (applications.length === 0) {
    return ok(res, { data: [] });
  }

  const candidatePayload = applications.map((a) => ({
    applicationId: a._id.toString(),
    applicantName: a.applicant?.name || 'Applicant',
    skills: a.applicant?.skills || [],
    education: a.applicant?.education || '',
    bio: a.applicant?.bio || '',
    coverLetter: a.coverLetter || '',
  }));

  const prompt = `Rank these job applicants for the following role:
Job Title: ${job.title}
Job Required Skills: ${(job.skills || []).join(', ')}
Job Description: ${job.description}

Applicants to evaluate:
${JSON.stringify(candidatePayload, null, 2)}

Evaluate each applicant's skills, background, and cover letter for alignment with the job.
Assign each applicant an objective score from 0 to 100 and a 1-sentence reason.
Return a JSON array of objects:
[
  {
    "applicationId": "<exact applicationId provided>",
    "score": <number 0-100>,
    "reason": "<concise 1-sentence justification for score>"
  }
]
Sort the array by score descending. Include every single applicant from the input. Output valid JSON only.`;

  const result = await ai.generate(prompt, { json: true, userId: req.user._id });
  const rawList = Array.isArray(result) ? result : (result?.rankings || result?.applicants || []);
  const rankedMap = new Map();

  for (const item of rawList) {
    if (item && item.applicationId) {
      rankedMap.set(String(item.applicationId), {
        applicationId: String(item.applicationId),
        score: Math.max(0, Math.min(100, Math.round(Number(item.score) || 0))),
        reason: String(item.reason || '').trim(),
      });
    }
  }

  // Ensure all loaded applications exist in output
  const finalRankings = applications.map((a) => {
    const id = a._id.toString();
    if (rankedMap.has(id)) {
      return rankedMap.get(id);
    }
    return {
      applicationId: id,
      score: 50,
      reason: 'Standard applicant evaluation',
    };
  });

  finalRankings.sort((a, b) => b.score - a.score);

  ok(res, { data: finalRankings });
});
