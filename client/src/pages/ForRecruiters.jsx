import { Link } from 'react-router-dom';

export default function ForRecruiters() {
  return (
    <div className="py-16 text-center max-w-4xl mx-auto">
      {/* Badge */}
      <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-1.5 text-xs text-[#c9c6e0] mb-8">
        <span className="h-2 w-2 rounded-full bg-[#7c5cff]" />
        <span>For Talent Leaders & Hiring Teams</span>
      </div>

      {/* Hero Headline */}
      <h1 className="headline-hero mb-6">
        Hire Verified Tech Talent<br />Faster and With Confidence
      </h1>

      {/* Subtitle */}
      <p className="mx-auto max-w-2xl text-lg text-[#c9c6e0] leading-relaxed mb-10">
        Stop reviewing generic resumes manually. SkillBridge ranks applicants by demonstrated competency and helps you publish targeted openings with smart AI drafting.
      </p>

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-center gap-4 mb-20">
        <Link to="/register?role=recruiter" className="btn-pill-primary">
          Post Jobs as a Recruiter
        </Link>
        <Link to="/login" className="btn-pill-secondary">
          Sign In to Recruiter Hub
        </Link>
      </div>

      {/* 3 Benefit Cards */}
      <div className="grid gap-6 md:grid-cols-3 text-left">
        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            ⚡
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Automated AI Ranking</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            Sort and evaluate 100+ candidates in seconds with transparent fit percentages and AI rationale for every applicant.
          </p>
        </div>

        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            ✍️
          </div>
          <h3 className="text-lg font-medium text-white mb-2">AI Job Description Assistant</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            Generate comprehensive, structured job postings with calibrated core skills from just a title in under 10 seconds.
          </p>
        </div>

        <div className="card-orchid">
          <div className="h-10 w-10 rounded-xl bg-[#7c5cff]/15 border border-[#7c5cff]/30 flex items-center justify-center text-lg text-[#7c5cff] mb-4">
            🎯
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Zero Spam, High Fit</h3>
          <p className="text-sm text-[#c9c6e0] leading-relaxed">
            Attract candidates whose verified capabilities and projects match your engineering needs, reducing interview rounds by 50%.
          </p>
        </div>
      </div>
    </div>
  );
}
