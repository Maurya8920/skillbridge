# SkillBridge — Internship & Job Management Platform

A MERN-stack platform where **students** find and apply to internships, **recruiters** post jobs and manage applicants, and an **admin** oversees the platform.

## 🚀 Live Demo

**Website:** https://skillbridge-one-sigma.vercel.app

**API:** https://skillbridge-api-x78g.onrender.com/api/health

> First load may take ~40 s while the free server wakes up.

| Role | Email | Password |
|------|-------|----------|
| Student | naman@student.dev | password123 |
| Recruiter | riya@techdevrit.com | password123 |
| Admin | admin@skillbridge.dev | password123 |

```
skillbridge/
├── client/   React 19 + Vite + Tailwind v4 + React Router + Axios
├── server/   Node + Express + Mongoose (MongoDB)
└── SkillBridge.postman_collection.json
```

## Features

| Role | Can |
|------|-----|
| Student | Register, edit profile & skills, upload resume (PDF/DOC/DOCX), search & filter jobs, AI match score & skill gap analysis, AI cover letter generator, apply once per job, track/withdraw applications |
| Recruiter | Create company profile, AI job description & skills generator, post/edit/close/delete own jobs, AI applicant ranking with scoring & rationale, change application status, add notes |
| Admin | Platform stats, list users, enable/disable accounts, remove any job |

### AI Features (Powered by Google Gemini API)
- **✨ Cover Letter Generator** (`POST /api/ai/cover-letter`): Generates tailored 150–200 word first-person professional cover letters matching the candidate's skills and the role's requirements.
- **✨ Job Description Generator** (`POST /api/ai/job-description`): Generates 120–180 word descriptions with 5–8 lowercase technical skill tags from a title and keywords.
- **✨ AI Match & Skill Gap** (`POST /api/ai/match`): Evaluates candidate fit, generates a 0–100 score, highlights matching reasons, and identifies missing skills.
- **✨ Applicant Ranking** (`POST /api/ai/rank-applicants`): Analyzes applicant profiles and cover letters to rank candidates by fit with clear hiring rationales.
- **Resilience & Rate Limiting**: Built-in in-memory rate limiter (max 20 calls/user/hour), quota resilience with multi-model fallback, and robust JSON schema parsing.

Security: JWT auth, bcrypt passwords, role-based `authorize()`, ownership checks (`createdBy`), field whitelisting on every write, unique `(job, applicant)` index, MIME + size validated uploads, central error handler (400/401/403/404/409/429/503), uniform response envelope `{ success, message, data, pagination? }`.

## Quick start

Prerequisites: Node 18+, a MongoDB URI (local `mongod` or Atlas), and a Google Gemini API Key from [Google AI Studio](https://aistudio.google.com/).

```bash
# 1. Server
cd server
cp .env.example .env        # fill MONGO_URI, JWT_SECRET, and GEMINI_API_KEY
npm install
npm run seed                # demo accounts + 12 jobs
npm run dev                 # http://localhost:5000

# 2. Client (new terminal)
cd client
npm install
npm run dev                 # http://localhost:5173  (proxies /api → :5000)
```

### Demo accounts (password `password123`)

| Role | Email |
|------|-------|
| Admin | admin@skillbridge.dev |
| Recruiter | riya@techdevrit.com, arjun@innotech.dev |
| Student | naman@student.dev, priya@student.dev, rahul@student.dev |

## Environment variables (`server/.env`)

| Key | Purpose |
|-----|---------|
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing tokens |
| `JWT_EXPIRE` | e.g. `7d` |
| `PORT` | API port (default 5000) |
| `CLIENT_URL` | Allowed CORS origin |
| `NODE_ENV` | `development` / `production` |
| `UPLOAD_DIR` | Resume folder (default `uploads`) |
| `MAX_UPLOAD_BYTES` | Max resume size (default 2 MB) |
| `GEMINI_API_KEY` | Google Gemini API Key (Get at [Google AI Studio](https://aistudio.google.com/)) |
| `GEMINI_MODEL` | Gemini model name (default `gemini-1.5-flash`) |


## API

Base URL: `http://localhost:5000/api`

| Method | Route | Access |
|--------|-------|--------|
| POST | `/auth/register` | public |
| POST | `/auth/login` | public |
| GET | `/auth/me` | any user |
| PUT | `/auth/profile` | any user (role not editable) |
| GET | `/jobs?keyword&jobType&workMode&location&minStipend&page&limit` | public |
| GET | `/jobs/:id` | public |
| GET | `/jobs/recruiter/my-jobs` | recruiter |
| POST | `/jobs` | recruiter |
| PUT / DELETE | `/jobs/:id` | recruiter (owner) |
| POST | `/applications/:jobId` | student |
| GET | `/applications/my` | student |
| GET | `/applications/job/:jobId?status` | recruiter (owner) |
| PATCH | `/applications/:id/status` | recruiter (owner) |
| PATCH | `/applications/:id/withdraw` | student (applicant) |
| POST | `/companies` · GET `/companies/me` | recruiter |
| GET | `/companies/:id` | public |
| POST | `/upload/resume` (form-data `resume`) | student |
| GET | `/admin/users` · PATCH `/admin/users/:id/status` | admin |
| GET | `/admin/jobs` · DELETE `/admin/jobs/:id` | admin |
| GET | `/admin/stats` | admin |
| POST | `/ai/cover-letter` | student |
| POST | `/ai/job-description` | recruiter |
| POST | `/ai/match` | student |
| POST | `/ai/rank-applicants` | recruiter (owner) |

Status codes: `401` not identified · `403` identified but not allowed · `400` malformed id / validation · `404` not found · `409` duplicate · `429` rate limit · `503` AI service unavailable.

## Testing

```bash
# API smoke test (58 checks). Uses an in-memory MongoDB, or set MONGO_TEST_URI to a running instance.
cd server && npm test


# Postman: import SkillBridge.postman_collection.json, run seed first, then run the collection top-to-bottom.
# CLI alternative:
npx newman run SkillBridge.postman_collection.json
```

## Production build

```bash
cd client && npm run build      # outputs client/dist — serve with any static host
cd server && NODE_ENV=production npm start
```

Set `CLIENT_URL` to the deployed frontend origin.
