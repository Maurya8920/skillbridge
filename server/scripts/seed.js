/* Seeds: 1 admin, 2 recruiters (+companies), 3 students, 12 jobs, a few applications.
   Usage: npm run seed   (reads MONGO_URI from .env) */
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const User = require('../models/User');
const Company = require('../models/Company');
const Job = require('../models/Job');
const Application = require('../models/Application');

const PASSWORD = 'password123';

const jobsData = [
  ['Frontend Developer Intern', 'internship', 'remote', 'Delhi', ['react', 'javascript', 'tailwind'], 15000],
  ['Backend Developer Intern', 'internship', 'hybrid', 'Noida', ['node.js', 'express', 'mongodb'], 18000],
  ['MERN Stack Developer', 'full-time', 'onsite', 'Gurugram', ['react', 'node.js', 'mongodb', 'express'], 45000],
  ['UI/UX Design Intern', 'internship', 'remote', 'Bengaluru', ['figma', 'ui design', 'prototyping'], 12000],
  ['Data Analyst Intern', 'internship', 'onsite', 'Pune', ['python', 'sql', 'excel'], 14000],
  ['DevOps Engineer', 'full-time', 'hybrid', 'Hyderabad', ['docker', 'aws', 'linux', 'ci/cd'], 60000],
  ['Content Writer (Part-time)', 'part-time', 'remote', 'Delhi', ['writing', 'seo'], 8000],
  ['Android Developer Intern', 'internship', 'onsite', 'Delhi', ['kotlin', 'android', 'java'], 16000],
  ['QA Automation Engineer', 'contract', 'remote', 'Mumbai', ['selenium', 'javascript', 'testing'], 35000],
  ['Machine Learning Intern', 'internship', 'hybrid', 'Bengaluru', ['python', 'pytorch', 'ml'], 20000],
  ['Full Stack Developer', 'full-time', 'remote', 'Remote', ['react', 'node.js', 'postgresql'], 55000],
  ['Digital Marketing Intern', 'internship', 'onsite', 'Noida', ['seo', 'social media', 'analytics'], 10000],
];

(async () => {
  await connectDB();
  await Promise.all([User.deleteMany(), Company.deleteMany(), Job.deleteMany(), Application.deleteMany()]);

  const admin = await User.create({ name: 'Admin', email: 'admin@skillbridge.dev', password: PASSWORD, role: 'admin' });

  const rec1 = await User.create({ name: 'Riya Sharma', email: 'riya@techdevrit.com', password: PASSWORD, role: 'recruiter' });
  const rec2 = await User.create({ name: 'Arjun Mehta', email: 'arjun@innotech.dev', password: PASSWORD, role: 'recruiter' });

  const comp1 = await Company.create({ name: 'TechDevrit Software', industry: 'Software', location: 'Delhi', website: 'https://techdevrit.com', description: 'Builds NV Editor and media tools.', createdBy: rec1._id });
  const comp2 = await Company.create({ name: 'Inno Tech Creators', industry: 'IT Services', location: 'Noida', website: 'https://innotech.dev', description: 'Custom software and web solutions.', createdBy: rec2._id });
  rec1.company = comp1._id; rec2.company = comp2._id;
  await Promise.all([rec1.save(), rec2.save()]);

  const students = await User.create([
    { name: 'Naman Verma', email: 'naman@student.dev', password: PASSWORD, role: 'student', location: 'Delhi', education: 'B.Tech CSE', skills: ['react', 'node.js', 'mongodb', 'javascript'] },
    { name: 'Priya Singh', email: 'priya@student.dev', password: PASSWORD, role: 'student', location: 'Noida', education: 'BCA', skills: ['python', 'sql', 'excel'] },
    { name: 'Rahul Gupta', email: 'rahul@student.dev', password: PASSWORD, role: 'student', location: 'Gurugram', education: 'MCA', skills: ['kotlin', 'android', 'java'] },
  ]);

  const jobs = await Job.create(
    jobsData.map(([title, jobType, workMode, location, skills, stipend], i) => {
      const owner = i % 2 === 0 ? rec1 : rec2;
      return {
        title,
        description: `We are hiring a ${title} to join ${owner === rec1 ? comp1.name : comp2.name}. You will work with ${skills.join(', ')} on real products. Freshers welcome.`,
        company: owner.company,
        createdBy: owner._id,
        jobType, workMode, location, skills, stipend,
        openings: (i % 3) + 1,
        deadline: new Date(Date.now() + (30 + i) * 86400000),
      };
    })
  );

  await Application.create([
    { job: jobs[0]._id, applicant: students[0]._id, status: 'shortlisted', coverLetter: 'I built a MERN project during my internship.' },
    { job: jobs[2]._id, applicant: students[0]._id, status: 'applied' },
    { job: jobs[4]._id, applicant: students[1]._id, status: 'under_review' },
    { job: jobs[7]._id, applicant: students[2]._id, status: 'applied' },
  ]);

  console.log('Seed complete.');
  console.log(`Login with password "${PASSWORD}":`);
  console.log(`  admin:     ${admin.email}`);
  console.log(`  recruiter: ${rec1.email}, ${rec2.email}`);
  console.log(`  student:   ${students.map((s) => s.email).join(', ')}`);
  await mongoose.disconnect();
})().catch((e) => { console.error(e); process.exit(1); });
