import { Link } from 'react-router-dom';

export default function ForStudents() {
  return (
    <div className="py-16 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-[#c9c6e0] mb-8">
        <span className="h-2 w-2 rounded-full bg-[#7c5cff]" />
        <span>For Early-Career Talent & Students</span>
      </div>

      {/* Hero Headline */}
      <h1 className="headline-hero mb-6">
        Launch Your Tech Career<br />With Precision AI Matching
      </h1>

      {/* Subtitle */}
      <p className="mx-auto max-w-2xl text-lg text-[#c9c6e0] leading-relaxed mb-10">
        Skip the endless application black hole. SkillBridge connects your verified skills and coursework directly to high-growth internships and full-time opportunities.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
        <Link to="/register?role=student" className="btn-pill-primary">
          Get Started as a Student
        </Link>
        <Link to="/jobs" className="btn-pill-secondary">
          Browse Open Jobs
        </Link>
      </div>

      {/* 3 Benefit Cards */}
      <div className="grid gap-6 md:grid-cols-3 text-left">
        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            ✨
          </div>
          <h3 className="text-lg font-medium text-white mb-2">AI Skill Fit Analysis</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            See exactly how well your profile and education align with any job opening before applying, with actionable skill gap recommendations.
          </p>
        </div>

        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            📝
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Instant Cover Letters</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            Generate customized, professional cover letters tailored specifically to the role and your background in a single click.
          </p>
        </div>

        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            🚀
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Direct Recruiter Access</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            Your application goes directly to verified hiring teams without keyword filtering or resume-eating ATS software.
          </p>
        </div>
      </div>
    </div>
  );
}
