/* End-to-end smoke test against an in-memory MongoDB. Run: node scripts/smoke.test.js */
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRE = '1h';
process.env.UPLOAD_DIR = 'uploads';

const { MongoMemoryServer } = require('mongodb-memory-server');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const app = require('../app');
const aiService = require('../services/ai');

// Mock ai.generate so tests run predictably without requiring a real API key
aiService.generate = async (prompt, { json = false } = {}) => {
  if (json) {
    if (prompt.includes('Rank these job applicants')) {
      return [{ applicationId: 'mockAppId', score: 90, reason: 'Strong match' }];
    }
    if (prompt.includes('Compare this student candidate')) {
      return { score: 85, reasons: ['Good match', 'Strong skills'], missingSkills: ['docker'] };
    }
    if (prompt.includes('job description')) {
      return { description: 'Mock description of the role.', skills: ['react', 'node'] };
    }
    return {};
  }
  return 'Mock cover letter text for student applicant.';
};

let base, server, passed = 0, failed = 0;
const tokens = {};

const req = async (method, path, { body, token, raw } = {}) => {
  const headers = {};
  if (token) headers.Authorization = `Bearer ${token}`;
  let payload;
  if (raw) payload = raw; else if (body) { headers['Content-Type'] = 'application/json'; payload = JSON.stringify(body); }
  const r = await fetch(base + path, { method, headers, body: payload });
  return { status: r.status, body: await r.json() };
};
const expect = (name, cond, extra = '') => { if (cond) { passed++; console.log('  ✓', name); } else { failed++; console.log('  ✗', name, extra); } };

(async () => {
  // Uses MONGO_TEST_URI if provided (e.g. a local mongod), else spins up an in-memory MongoDB
  let mongod = null;
  if (process.env.MONGO_TEST_URI) {
    await mongoose.connect(process.env.MONGO_TEST_URI);
    await mongoose.connection.dropDatabase();
  } else {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
  }
  server = app.listen(0);
  base = `http://127.0.0.1:${server.address().port}`;

  console.log('AUTH');
  let r = await req('POST', '/api/auth/register', { body: { name: 'Stu', email: 'stu@x.com', password: 'secret1', role: 'student' } });
  expect('register student 201', r.status === 201 && r.body.success && r.body.data.token); tokens.student = r.body.data.token;
  r = await req('POST', '/api/auth/register', { body: { name: 'Rec', email: 'rec@x.com', password: 'secret1', role: 'recruiter' } });
  expect('register recruiter 201', r.status === 201); tokens.recruiter = r.body.data.token;
  r = await req('POST', '/api/auth/register', { body: { name: 'Rec2', email: 'rec2@x.com', password: 'secret1', role: 'recruiter' } });
  tokens.recruiter2 = r.body.data.token;
  r = await req('POST', '/api/auth/register', { body: { name: 'Evil', email: 'evil@x.com', password: 'secret1', role: 'admin' } });
  expect('cannot self-register as admin', r.body.data.user.role === 'student');
  r = await req('POST', '/api/auth/register', { body: { name: 'Dup', email: 'stu@x.com', password: 'secret1' } });
  expect('duplicate email 409', r.status === 409);
  r = await req('POST', '/api/auth/register', { body: { name: 'Short', email: 'short@x.com', password: '123' } });
  expect('short password 400', r.status === 400);
  const a = await req('POST', '/api/auth/login', { body: { email: 'nobody@x.com', password: 'x' } });
  const b = await req('POST', '/api/auth/login', { body: { email: 'stu@x.com', password: 'wrong' } });
  expect('login: identical error for unknown email / wrong password', a.status === 401 && b.status === 401 && a.body.message === b.body.message);
  r = await req('GET', '/api/auth/me', { token: tokens.student });
  expect('me returns user without password', r.status === 200 && r.body.data.password === undefined);
  r = await req('GET', '/api/auth/me');
  expect('me without token 401', r.status === 401);
  r = await req('GET', '/api/auth/me', { token: tokens.student.slice(0, -3) + 'abc' });
  expect('tampered token 401', r.status === 401);
  r = await req('PUT', '/api/auth/profile', { token: tokens.student, body: { role: 'admin', skills: 'React, Node.js', bio: 'hi' } });
  expect('profile update ignores role, lowercases skills', r.body.data.role === 'student' && r.body.data.skills.includes('react'));

  // admin via direct DB insert (seeded in real life)
  const User = require('../models/User');
  const admin = await User.create({ name: 'Admin', email: 'admin@x.com', password: 'secret1', role: 'admin' });
  tokens.admin = jwt.sign({ id: admin._id.toString() }, process.env.JWT_SECRET);

  console.log('COMPANIES + JOBS');
  r = await req('POST', '/api/jobs', { token: tokens.recruiter, body: { title: 'x', description: 'y', jobType: 'internship', workMode: 'remote' } });
  expect('post job without company 400', r.status === 400);
  r = await req('POST', '/api/companies', { token: tokens.recruiter, body: { name: 'Acme', industry: 'IT' } });
  expect('create company 201', r.status === 201); const companyId = r.body.data._id;
  r = await req('POST', '/api/companies', { token: tokens.student, body: { name: 'Nope' } });
  expect('student cannot create company 403', r.status === 403);
  r = await req('POST', '/api/companies', { token: tokens.recruiter2, body: { name: 'Beta' } });
  r = await req('POST', '/api/jobs', { token: tokens.recruiter, body: { title: 'React Intern', description: 'Build UI', jobType: 'internship', workMode: 'remote', location: 'Delhi', skills: ['React', 'JS'], stipend: 15000, createdBy: admin._id } });
  expect('create job 201, createdBy from token', r.status === 201 && r.body.data.createdBy !== admin._id.toString()); const jobId = r.body.data._id;
  for (let i = 0; i < 12; i++) await req('POST', '/api/jobs', { token: tokens.recruiter, body: { title: `Job ${i}`, description: i % 2 ? 'python data' : 'node backend', jobType: i % 2 ? 'full-time' : 'internship', workMode: 'onsite', location: i % 3 ? 'Noida' : 'Delhi', stipend: 1000 * i } });
  r = await req('POST', '/api/jobs', { token: tokens.student, body: { title: 'x', description: 'y', jobType: 'internship', workMode: 'remote' } });
  expect('student cannot post job 403', r.status === 403);
  r = await req('POST', '/api/jobs', { token: tokens.recruiter2, body: { title: 'x', description: 'y', jobType: 'internship', workMode: 'remote', company: companyId } });
  expect('cannot post for another recruiter\'s company 403', r.status === 403);
  r = await req('GET', '/api/jobs?limit=5&page=2');
  expect('pagination: page 2 of 5', r.body.pagination.total === 13 && r.body.pagination.pages === 3 && r.body.data.length === 5, JSON.stringify(r.body.pagination));
  r = await req('GET', '/api/jobs?keyword=react');
  expect('keyword search matches skills/title', r.body.data.length === 1 && r.body.data[0].title === 'React Intern');
  r = await req('GET', '/api/jobs?jobType=full-time&location=noida&minStipend=5000');
  expect('combined filters', r.body.data.every((j) => j.jobType === 'full-time' && j.stipend >= 5000 && /noida/i.test(j.location)) && r.body.data.length > 0);
  r = await req('GET', '/api/jobs/recruiter/my-jobs', { token: tokens.recruiter });
  expect('my-jobs route not swallowed by /:id', r.status === 200 && r.body.data.length === 13 && 'applicationCount' in r.body.data[0]);
  r = await req('GET', '/api/jobs/notanid');
  expect('malformed id 400', r.status === 400);
  r = await req('GET', `/api/jobs/${new mongoose.Types.ObjectId()}`);
  expect('missing job 404', r.status === 404);
  r = await req('PUT', `/api/jobs/${jobId}`, { token: tokens.recruiter2, body: { title: 'Hacked' } });
  expect('non-owner edit 403', r.status === 403);
  r = await req('PUT', `/api/jobs/${jobId}`, { token: tokens.recruiter, body: { title: 'React Intern 2', createdBy: admin._id } });
  expect('owner edit ok, createdBy untouched', r.status === 200 && r.body.data.title === 'React Intern 2' && r.body.data.createdBy !== admin._id.toString());

  console.log('APPLICATIONS');
  r = await req('POST', `/api/applications/${jobId}`, { token: tokens.student, body: { coverLetter: 'Hire me' } });
  expect('apply 201', r.status === 201); const appId = r.body.data._id;
  r = await req('POST', `/api/applications/${jobId}`, { token: tokens.student });
  expect('duplicate apply 409', r.status === 409);
  r = await req('POST', `/api/applications/${jobId}`, { token: tokens.recruiter });
  expect('recruiter cannot apply 403', r.status === 403);
  r = await req('GET', '/api/applications/my', { token: tokens.student });
  expect('my applications populated', r.body.data.length === 1 && r.body.data[0].job.title === 'React Intern 2');
  r = await req('GET', `/api/applications/job/${jobId}`, { token: tokens.recruiter2 });
  expect('non-owner cannot view applicants 403', r.status === 403);
  r = await req('GET', `/api/applications/job/${jobId}`, { token: tokens.recruiter });
  expect('owner views applicants', r.status === 200 && r.body.data.applications.length === 1 && r.body.data.applications[0].applicant.email === 'stu@x.com');
  r = await req('PATCH', `/api/applications/${appId}/status`, { token: tokens.recruiter2, body: { status: 'selected' } });
  expect('non-owner status change 403', r.status === 403);
  r = await req('PATCH', `/api/applications/${appId}/status`, { token: tokens.recruiter, body: { status: 'bogus' } });
  expect('invalid status 400', r.status === 400);
  r = await req('PATCH', `/api/applications/${appId}/status`, { token: tokens.recruiter, body: { status: 'shortlisted', note: 'Good' } });
  expect('owner status change', r.status === 200 && r.body.data.status === 'shortlisted');
  r = await req('PATCH', `/api/applications/${appId}/withdraw`, { token: tokens.recruiter });
  expect('recruiter cannot withdraw 403', r.status === 403);
  r = await req('PATCH', `/api/applications/${appId}/withdraw`, { token: tokens.student });
  expect('student withdraw', r.body.data.status === 'withdrawn');
  await req('PUT', `/api/jobs/${jobId}`, { token: tokens.recruiter, body: { isActive: false } });
  r = await req('POST', `/api/applications/${jobId}`, { token: tokens.recruiter2 });
  r = await req('POST', '/api/auth/register', { body: { name: 'S2', email: 's2@x.com', password: 'secret1' } });
  r = await req('POST', `/api/applications/${jobId}`, { token: r.body.data.token });
  expect('apply to inactive job 400', r.status === 400);

  console.log('UPLOAD');
  const fd = new FormData();
  fd.append('resume', new Blob(['%PDF-1.4 fake'], { type: 'application/pdf' }), 'cv.pdf');
  r = await req('POST', '/api/upload/resume', { token: tokens.student, raw: fd });
  expect('resume upload', r.status === 200 && r.body.data.resumeUrl.startsWith('/uploads/'), JSON.stringify(r.body));
  const fd2 = new FormData();
  fd2.append('resume', new Blob(['x'], { type: 'image/png' }), 'x.png');
  r = await req('POST', '/api/upload/resume', { token: tokens.student, raw: fd2 });
  expect('reject non-document 400', r.status === 400);
  const fs = require('fs'); const path = require('path');
  for (const f of fs.readdirSync(path.resolve('uploads'))) if (f !== '.gitkeep') fs.unlinkSync(path.resolve('uploads', f));

  console.log('AI');
  const missingJobId = new mongoose.Types.ObjectId();

  // 1. cover-letter: student only (403 for recruiter), 404 for missing jobId
  r = await req('POST', '/api/ai/cover-letter', { token: tokens.recruiter, body: { jobId } });
  expect('cover-letter recruiter 403', r.status === 403);
  r = await req('POST', '/api/ai/cover-letter', { token: tokens.student, body: { jobId: missingJobId } });
  expect('cover-letter missing job 404', r.status === 404);
  r = await req('POST', '/api/ai/cover-letter', { token: tokens.student, body: { jobId } });
  expect('cover-letter student 200', r.status === 200 && Boolean(r.body.data?.coverLetter));

  // 2. job-description: recruiter only (403 for student)
  r = await req('POST', '/api/ai/job-description', { token: tokens.student, body: { title: 'Engineer' } });
  expect('job-description student 403', r.status === 403);
  r = await req('POST', '/api/ai/job-description', { token: tokens.recruiter, body: { title: 'Backend Dev', keywords: 'Node', jobType: 'full-time', workMode: 'remote' } });
  expect('job-description recruiter 200', r.status === 200 && Boolean(r.body.data?.description) && Array.isArray(r.body.data?.skills));

  // 3. match: student only (403 for recruiter), 404 for missing jobId
  r = await req('POST', '/api/ai/match', { token: tokens.recruiter, body: { jobId } });
  expect('match recruiter 403', r.status === 403);
  r = await req('POST', '/api/ai/match', { token: tokens.student, body: { jobId: missingJobId } });
  expect('match missing job 404', r.status === 404);
  r = await req('POST', '/api/ai/match', { token: tokens.student, body: { jobId } });
  expect('match student 200', r.status === 200 && typeof r.body.data?.score === 'number' && Array.isArray(r.body.data?.reasons));

  // 4. rank-applicants: recruiter only (403 for student), owner only (403 for recruiter2), 404 for missing jobId
  r = await req('POST', '/api/ai/rank-applicants', { token: tokens.student, body: { jobId } });
  expect('rank-applicants student 403', r.status === 403);
  r = await req('POST', '/api/ai/rank-applicants', { token: tokens.recruiter2, body: { jobId } });
  expect('rank-applicants non-owner 403', r.status === 403);
  r = await req('POST', '/api/ai/rank-applicants', { token: tokens.recruiter, body: { jobId: missingJobId } });
  expect('rank-applicants missing job 404', r.status === 404);
  r = await req('POST', '/api/ai/rank-applicants', { token: tokens.recruiter, body: { jobId } });
  expect('rank-applicants recruiter 200', r.status === 200 && Array.isArray(r.body.data));

  console.log('ADMIN');
  r = await req('GET', '/api/admin/users', { token: tokens.recruiter });
  expect('recruiter blocked from admin 403', r.status === 403);
  r = await req('GET', '/api/admin/users', { token: tokens.admin });
  expect('admin lists users without passwords', r.status === 200 && r.body.data.every((u) => u.password === undefined));
  const stuId = r.body.data.find((u) => u.email === 'stu@x.com')._id;
  r = await req('PATCH', `/api/admin/users/${stuId}/status`, { token: tokens.admin, body: { isActive: false } });
  expect('disable user', r.body.data.isActive === false);
  r = await req('GET', '/api/auth/me', { token: tokens.student });
  expect('disabled user rejected 401 on next request', r.status === 401);
  await req('PATCH', `/api/admin/users/${stuId}/status`, { token: tokens.admin, body: { isActive: true } });
  r = await req('GET', '/api/admin/stats', { token: tokens.admin });
  expect('stats', r.body.data.jobs === 13 && r.body.data.students === 3);
  r = await req('DELETE', `/api/admin/jobs/${jobId}`, { token: tokens.admin });
  expect('admin deletes job', r.status === 200);
  r = await req('GET', '/api/applications/my', { token: tokens.student });
  expect('cascade removed application', r.body.data.length === 0);
  r = await req('GET', '/api/nope');
  expect('unknown route 404 envelope', r.status === 404 && r.body.success === false);

  console.log(`\n${passed} passed, ${failed} failed`);
  server.close(); await mongoose.disconnect(); if (mongod) await mongod.stop();
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
