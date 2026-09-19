import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <div className="w-full">
      {/* Hero Section */}
      <section className="pt-20 md:pt-28 pb-0 text-center flex flex-col items-center">
        <div className="mx-auto max-w-[1440px] px-6">
          {/* Centred Headline in 3 lines, 56px/1.15, weight 500 */}
          <h1 className="headline-hero max-w-4xl mx-auto">
            Find Internships and<br />
            Jobs that Match<br />
            Your Skills
          </h1>

          {/* Sub-paragraph 18px, #c9c6e0, max-width 760px */}
          <p className="mt-6 mx-auto max-w-[760px] text-lg leading-relaxed text-[#c9c6e0]">
            SkillBridge connects students and top recruiters with autonomous AI skill matching,
            instant tailored cover letters, and intelligent candidate ranking. Find your next breakthrough role in seconds.
          </p>

          {/* Two Buttons: "Get Started" (purple) and "Browse Jobs" (white) */}
          <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
            <Link to="/register" className="btn-pill-primary">
              Get Started
            </Link>
            <Link to="/jobs" className="btn-pill-secondary">
              Browse Jobs
            </Link>
          </div>

          {/* Dashboard Preview Card cut off at the bottom like the reference */}
          <div className="mt-16 md:mt-20 mx-auto max-w-5xl overflow-hidden rounded-t-[24px] border-t border-x border-white/15 bg-[#12102b] shadow-[0_-15px_60px_rgba(0,0,0,0.8),0_0_50px_rgba(124,92,255,0.15)] text-left">
            {/* Window title bar */}
            <div className="flex h-11 items-center justify-between border-b border-white/10 bg-[#0d0b24] px-5 text-xs text-[#c9c6e0]">
              <div className="flex items-center gap-2">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-3 font-semibold text-white/90">SkillBridge Dashboard</span>
                <span className="text-white/40 hidden sm:inline">(Updated 2 hours ago)</span>
              </div>
              <span className="badge-pill py-0.5 text-[11px]">✨ AI Powered</span>
            </div>

            {/* Dashboard Inner Body */}
            <div className="p-6 md:p-8 space-y-6">
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {/* Metric 1: Total Jobs */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase font-medium text-[#c9c6e0]/70 tracking-wider">
                    Total Active Roles
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    1,240
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400">
                    <span>↑ 18%</span>
                    <span className="text-[#c9c6e0]/60">vs last month</span>
                  </div>
                </div>

                {/* Metric 2: Match Score Average */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase font-medium text-[#c9c6e0]/70 tracking-wider">
                    Avg Match Precision
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-[#7c5cff]">
                    94.8%
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-xs text-[#c9c6e0]/80">
                    <span>Targeted skill tags verified</span>
                  </div>
                </div>

                {/* Metric 3: Application Ratio */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase font-medium text-[#c9c6e0]/70 tracking-wider">
                    Shortlist Rate
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    40%
                  </div>
                  <div className="mt-3 text-xs text-[#c9c6e0]/60">
                    2.8x industry benchmark
                  </div>
                </div>

                {/* Metric 4: AI Generations */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
                  <div className="text-xs uppercase font-medium text-[#c9c6e0]/70 tracking-wider">
                    AI Cover Letters
                  </div>
                  <div className="mt-2 text-3xl font-semibold text-white">
                    12.4k
                  </div>
                  <div className="mt-3 text-xs text-amber-400">
                    ⚡ Under 3s latency
                  </div>
                </div>
              </div>

              {/* Bottom Row: Applications Breakdown & SVG Multi-line Chart */}
              <div className="grid gap-5 lg:grid-cols-12">
                {/* Applications status breakdown */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-5 space-y-3.5">
                  <div className="text-sm font-semibold text-white">
                    Application Pipeline
                  </div>
                  <div className="space-y-2.5">
                    <div>
                      <div className="flex justify-between text-xs text-[#c9c6e0] mb-1">
                        <span>Shortlisted</span>
                        <span className="font-semibold text-white">85%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[#7c5cff]" style={{ width: '85%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#c9c6e0] mb-1">
                        <span>Under Review</span>
                        <span className="font-semibold text-white">48%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[#a78bfa]" style={{ width: '48%' }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs text-[#c9c6e0] mb-1">
                        <span>Direct Candidate Matches</span>
                        <span className="font-semibold text-white">92%</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                        <div className="h-full rounded-full bg-[#ec4899]" style={{ width: '92%' }} />
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {['react', 'node.js', 'typescript', 'python', 'mongodb'].map((skill) => (
                      <span key={skill} className="badge-pill text-[11px]">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Multi-line curved SVG chart (matching the reference image) */}
                <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 lg:col-span-7">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-semibold text-white">Placement Velocity Trends</span>
                    <span className="text-xs text-[#c9c6e0]/60">Last 6 months</span>
                  </div>

                  {/* SVG Multi-curve line chart */}
                  <div className="h-44 w-full">
                    <svg viewBox="0 0 500 180" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                      {/* Grid lines */}
                      <line x1="0" y1="30" x2="500" y2="30" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="80" x2="500" y2="80" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />
                      <line x1="0" y1="130" x2="500" y2="130" stroke="rgba(255,255,255,0.06)" strokeDasharray="4 4" />

                      {/* Purple Curve 1 */}
                      <path
                        d="M0,140 C80,120 120,40 200,60 C280,80 340,30 420,45 C460,52 480,35 500,25"
                        fill="none"
                        stroke="#7c5cff"
                        strokeWidth="3"
                        strokeLinecap="round"
                      />

                      {/* Pink Curve 2 */}
                      <path
                        d="M0,160 C90,140 140,90 220,110 C300,130 360,70 430,85 C470,95 490,75 500,60"
                        fill="none"
                        stroke="#ec4899"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                      />

                      {/* Amber Curve 3 */}
                      <path
                        d="M0,170 C100,165 150,130 230,145 C310,160 380,110 440,125 C470,130 490,115 500,100"
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                  </div>

                  {/* Legend */}
                  <div className="flex items-center justify-center gap-6 mt-2 text-xs text-[#c9c6e0]">
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#7c5cff]" />
                      <span>Shortlisted</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#ec4899]" />
                      <span>Interviewed</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                      <span>Offered</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
