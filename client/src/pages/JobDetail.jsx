import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { Spinner, ErrorState, formatINR, formatDate, StatusBadge, Alert } from '../components/ui';

export default function JobDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const { data: job, loading, error, refetch } = useFetch(`/jobs/${id}`);
  const isStudent = user?.role === 'student';
  const { data: myApps } = useFetch(isStudent ? '/applications/my' : null);
  const existing = isStudent ? (myApps || []).find((a) => a.job?._id === id) : null;

  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const runAiMatch = async () => {
    setAiLoading(true);
    setAiErr('');
    try {
      const res = await api.post('/ai/match', { jobId: id });
      if (res.data?.data) {
        setAiResult(res.data.data);
      }
    } catch (e) {
      setAiErr(errMsg(e));
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const mySkills = user?.skills || [];
  const matched = (job.skills || []).filter((s) => mySkills.includes(s));
  const fallbackPct = job.skills?.length ? Math.round((matched.length / job.skills.length) * 100) : 0;
  const expired = job.deadline && new Date(job.deadline) < new Date();
  const canApply = isStudent && job.isActive && !expired && !existing;

  return (
    <div className="grid gap-6 lg:grid-cols-3 py-6">
      <div className="lg:col-span-2 space-y-6">
        <div className="card-orchid">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-medium tracking-tight text-white">{job.title}</h1>
              <p className="text-[#c9c6e0] mt-1">{job.company?.name} · {job.location || 'Anywhere'}</p>
            </div>
            {!job.isActive && (
              <span className="badge-pill border-rose-500/30 bg-rose-500/10 text-rose-300">
                Closed
              </span>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="badge-pill capitalize">{job.jobType}</span>
            <span className="badge-pill capitalize">{job.workMode}</span>
          </div>

          <h2 className="mt-8 text-lg font-medium text-white tracking-tight">About the role</h2>
          <p className="mt-2.5 whitespace-pre-line text-sm leading-relaxed text-[#c9c6e0]">{job.description}</p>

          <h2 className="mt-8 text-lg font-medium text-white tracking-tight">Skills required</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {job.skills?.map((s) => (
              <span
                key={s}
                className={`badge-pill ${
                  mySkills.includes(s)
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                    : ''
                }`}
              >
                {mySkills.includes(s) && <span className="text-[10px]">✓</span>}
                {s}
              </span>
            ))}
            {!job.skills?.length && <span className="text-sm text-[#c9c6e0]/60">Not specified</span>}
          </div>
        </div>

        {job.company?.description && (
          <div className="card-orchid">
            <h2 className="text-lg font-medium text-white tracking-tight">About {job.company.name}</h2>
            <p className="mt-2.5 text-sm leading-relaxed text-[#c9c6e0]">{job.company.description}</p>
            <p className="mt-4 text-xs text-[#c9c6e0]/60">
              {job.company.industry} · {job.company.location}
              {job.company.website && (
                <> · <a className="text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150" href={job.company.website} target="_blank" rel="noreferrer">Visit Website</a></>
              )}
            </p>
          </div>
        )}
      </div>

      <aside className="space-y-6">
        {/* Job metadata card */}
        <div className="card-orchid space-y-3.5 text-sm">
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-[#c9c6e0]/70 font-medium">Stipend</span>
            <span className="font-semibold text-white">{formatINR(job.stipend)}{job.stipend ? '/mo' : ''}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-[#c9c6e0]/70 font-medium">Openings</span>
            <span className="font-medium text-white">{job.openings}</span>
          </div>
          <div className="flex justify-between items-center pb-3 border-b border-white/10">
            <span className="text-xs uppercase tracking-wider text-[#c9c6e0]/70 font-medium">Deadline</span>
            <span className={`font-medium ${expired ? 'text-rose-400 font-semibold' : 'text-white'}`}>{formatDate(job.deadline)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-xs uppercase tracking-wider text-[#c9c6e0]/70 font-medium">Posted</span>
            <span className="font-medium text-white">{formatDate(job.createdAt)}</span>
          </div>
        </div>

        {/* AI Skill Match Card for students */}
        {isStudent && (
          <div className="card-orchid border-[#7c5cff]/30 bg-[#7c5cff]/[0.03] space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[#7c5cff]">✨</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-white">AI Candidate Match</span>
              </div>
              {aiResult && (
                <button
                  onClick={runAiMatch}
                  disabled={aiLoading}
                  className="text-xs font-medium text-[#7c5cff] hover:text-[#6a4ce6] underline transition-colors duration-150"
                >
                  Recalculate
                </button>
              )}
            </div>

            {/* If AI has not been run yet */}
            {!aiResult && (
              <div className="space-y-4">
                <p className="text-xs text-[#c9c6e0] leading-relaxed">
                  Let AI analyze how well your profile, education, and skills align with this role.
                </p>
                <button
                  type="button"
                  onClick={runAiMatch}
                  disabled={aiLoading}
                  className="btn-pill-primary w-full text-sm"
                >
                  {aiLoading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 rounded-full border-2 border-white/30 border-t-white" />
                      <span>Analyzing profile with AI…</span>
                    </span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>✨</span>
                      <span>Run AI match</span>
                    </span>
                  )}
                </button>

                {aiErr && (
                  <div className="pt-1">
                    <Alert type="error">
                      <p className="text-xs">{aiErr}</p>
                    </Alert>
                  </div>
                )}

                {/* Fallback exact-match count */}
                <div className="pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between text-xs text-[#c9c6e0] mb-1.5">
                    <span>Direct skill match</span>
                    <span className="font-semibold text-white">{fallbackPct}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div className="h-2 rounded-full bg-[#7c5cff]" style={{ width: `${fallbackPct}%` }} />
                  </div>
                  <p className="mt-1.5 text-[11px] text-[#c9c6e0]/60">
                    {matched.length} of {job.skills?.length || 0} skills match your profile
                  </p>
                </div>
              </div>
            )}

            {/* When AI result is ready */}
            {aiResult && (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between text-xs font-medium text-white mb-2">
                    <span>AI Fit Score</span>
                    <span className="text-base font-semibold text-[#7c5cff]">{aiResult.score}%</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-2 rounded-full ${
                        aiResult.score >= 70 ? 'bg-emerald-500' : aiResult.score >= 40 ? 'bg-[#7c5cff]' : 'bg-rose-500'
                      }`}
                      style={{ width: `${aiResult.score}%` }}
                    />
                  </div>
                </div>

                {/* AI Reasons */}
                {aiResult.reasons?.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c9c6e0]/70">Why you match:</span>
                    <ul className="space-y-1.5">
                      {aiResult.reasons.map((r, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-[#c9c6e0] leading-snug">
                          <span className="text-[#7c5cff] text-xs mt-0.5">•</span>
                          <span>{r}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Missing Skills */}
                {aiResult.missingSkills?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-white/10">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-[#c9c6e0]/70">Suggested skills to learn:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {aiResult.missingSkills.map((s, i) => (
                        <span key={i} className="badge-pill border-rose-500/30 bg-rose-500/10 text-rose-300 text-[11px]">
                          + {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Fallback comparison */}
                <div className="pt-2 border-t border-white/10 text-[11px] text-[#c9c6e0]/50">
                  Exact profile skills matching: {matched.length}/{job.skills?.length || 0} ({fallbackPct}%)
                </div>
              </div>
            )}

            {!mySkills.length && (
              <Link to="/profile" className="mt-2 block text-xs text-[#7c5cff] hover:text-[#6a4ce6] font-medium underline transition-colors duration-150">
                Add skills to your profile for better AI accuracy
              </Link>
            )}
          </div>
        )}

        {/* Action card: Apply / Login / Status */}
        <div className="card-orchid">
          {existing ? (
            <div className="text-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[#c9c6e0]">Application status:</span>
                <StatusBadge status={existing.status} />
              </div>
              <Link to="/applications" className="block text-xs text-[#7c5cff] hover:text-[#6a4ce6] font-semibold underline transition-colors duration-150">
                View my applications →
              </Link>
            </div>
          ) : !user ? (
            <Link to="/login" state={{ from: `/jobs/${id}` }} className="btn-pill-primary w-full">
              Login to apply
            </Link>
          ) : isStudent ? (
            <Link
              to={canApply ? `/jobs/${id}/apply` : '#'}
              className={`btn-pill-primary w-full ${!canApply ? 'pointer-events-none opacity-50' : ''}`}
              aria-disabled={!canApply}
            >
              {expired ? 'Deadline passed' : !job.isActive ? 'Position Closed' : 'Apply now'}
            </Link>
          ) : (
            <p className="text-xs text-[#c9c6e0]/60 text-center py-2">
              Recruiters cannot apply to jobs.
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
