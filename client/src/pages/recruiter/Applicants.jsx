import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import api, { errMsg, getUploadUrl } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Spinner, EmptyState, ErrorState, PageTitle, Alert, StatusBadge, formatDate } from '../../components/ui';

const TABS = ['all', 'applied', 'under_review', 'shortlisted', 'selected', 'rejected', 'withdrawn'];
const NEXT = ['under_review', 'shortlisted', 'selected', 'rejected'];

export default function Applicants() {
  const { id } = useParams();
  const [tab, setTab] = useState('all');
  const { data, loading, error, refetch } = useFetch(`/applications/job/${id}`, tab === 'all' ? undefined : { status: tab }, [tab]);
  const [err, setErr] = useState('');
  const [busyId, setBusyId] = useState(null);

  // AI Ranking state
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRankMap, setAiRankMap] = useState(null); // Map of applicationId -> { score, reason }
  const [sortByAi, setSortByAi] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const rankWithAi = async () => {
    setAiLoading(true);
    setAiErr('');
    try {
      const res = await api.post('/ai/rank-applicants', { jobId: id });
      const list = res.data?.data || [];
      const map = {};
      list.forEach((item) => {
        if (item.applicationId) {
          map[item.applicationId] = { score: item.score, reason: item.reason };
        }
      });
      setAiRankMap(map);
      setSortByAi(true);
    } catch (e) {
      setAiErr(errMsg(e));
    } finally {
      setAiLoading(false);
    }
  };

  const toggleSort = () => {
    setSortByAi((prev) => !prev);
  };

  const setStatus = async (app, status) => {
    setBusyId(app._id);
    setErr('');
    try {
      await api.patch(`/applications/${app._id}/status`, { status });
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setBusyId(null);
    }
  };

  const rawApps = data?.applications || [];

  // Sort applications based on active toggle
  const apps = [...rawApps].sort((a, b) => {
    if (sortByAi && aiRankMap) {
      const scoreA = aiRankMap[a._id]?.score ?? -1;
      const scoreB = aiRankMap[b._id]?.score ?? -1;
      return scoreB - scoreA;
    }
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  return (
    <div className="py-6">
      <PageTitle
        title={data?.job?.title ? `Applicants — ${data.job.title}` : 'Applicants'}
        subtitle={data?.job ? `${rawApps.length} total applicant${rawApps.length === 1 ? '' : 's'}` : ''}
        action={
          <div className="flex flex-wrap items-center gap-3">
            {aiRankMap ? (
              <button
                type="button"
                onClick={toggleSort}
                className="btn-pill-ghost btn-pill-sm"
                title="Toggle between AI score ranking and chronological date order"
              >
                {sortByAi ? '📅 View in Date Order' : '✨ View in AI Ranked Order'}
              </button>
            ) : null}

            <button
              type="button"
              onClick={rankWithAi}
              disabled={aiLoading || !rawApps.length}
              className="btn-pill-primary btn-pill-sm gap-2"
              title={!rawApps.length ? 'No applicants to rank' : 'Use AI to analyze and rank applicants by job fit'}
            >
              <span>✨</span>
              <span>{aiLoading ? 'Ranking with AI…' : aiRankMap ? 'Re-Rank with AI' : 'Rank with AI'}</span>
            </button>

            <Link to="/recruiter/jobs" className="btn-pill-ghost btn-pill-sm">
              ← My postings
            </Link>
          </div>
        }
      />

      {sortByAi && aiRankMap && (
        <div className="mb-6 flex items-center justify-between rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 px-4 py-3 text-xs text-white">
          <span className="flex items-center gap-2 font-medium">
            <span>✨</span>
            <span>Sorted by AI Candidate Fit Score</span>
          </span>
          <button
            onClick={() => setSortByAi(false)}
            className="font-medium underline hover:text-[#c9c6e0] transition-colors duration-150"
          >
            Reset to Date Order
          </button>
        </div>
      )}

      {aiErr && (
        <div className="mb-6">
          <Alert type="error">
            <div className="flex items-center justify-between">
              <span>{aiErr}</span>
              <button type="button" onClick={() => setAiErr('')} className="ml-2 font-semibold underline text-xs">Dismiss</button>
            </div>
          </Alert>
        </div>
      )}

      <div className="mb-6 flex gap-2 overflow-x-auto pb-1">
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-xs font-medium capitalize transition-colors duration-150 ${
              tab === t
                ? 'bg-[#7c5cff] text-white'
                : 'bg-white/[0.04] text-[#c9c6e0] border border-white/10 hover:bg-white/[0.08]'
            }`}
          >
            {t.replace('_', ' ')}
          </button>
        ))}
      </div>

      {err && (
        <div className="mb-6">
          <Alert type="error">{err}</Alert>
        </div>
      )}

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !apps.length ? (
        <EmptyState title={tab === 'all' ? 'No applicants yet' : `No ${tab.replace('_', ' ')} applicants`} />
      ) : (
        <>
          {/* Table on tablet+ */}
          <div className="card-orchid hidden overflow-x-auto p-0 md:block">
            <table className="w-full text-sm">
              <thead className="bg-white/[0.02] text-left text-xs uppercase tracking-wider text-[#c9c6e0]/70 border-b border-white/10">
                <tr>
                  <th className="px-5 py-3.5">Applicant</th>
                  {aiRankMap && <th className="px-5 py-3.5">✨ AI Rank</th>}
                  <th className="px-5 py-3.5">Skills</th>
                  <th className="px-5 py-3.5">Resume</th>
                  <th className="px-5 py-3.5">Applied</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {apps.map((a) => {
                  const aiEval = aiRankMap ? aiRankMap[a._id] : null;
                  return (
                    <tr key={a._id} className="hover:bg-white/[0.02] transition-colors duration-150">
                      <td className="px-5 py-4">
                        <p className="font-medium text-white">{a.applicant?.name}</p>
                        <p className="text-xs text-[#c9c6e0]">
                          {a.applicant?.email}
                          {a.applicant?.education && ` · ${a.applicant.education}`}
                        </p>
                      </td>

                      {aiRankMap && (
                        <td className="px-5 py-4 min-w-48">
                          {aiEval ? (
                            <div className="space-y-1.5">
                              <span
                                className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                                  aiEval.score >= 70
                                    ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30'
                                    : aiEval.score >= 40
                                    ? 'bg-[#7c5cff]/15 text-[#a78bfa] border border-[#7c5cff]/30'
                                    : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
                                }`}
                              >
                                <span>✨</span>
                                <span>{aiEval.score}% fit</span>
                              </span>
                              {aiEval.reason && (
                                <p className="text-[11px] leading-snug text-[#c9c6e0] max-w-xs line-clamp-2" title={aiEval.reason}>
                                  {aiEval.reason}
                                </p>
                              )}
                            </div>
                          ) : (
                            <span className="text-xs text-[#c9c6e0]/50">—</span>
                          )}
                        </td>
                      )}

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-1.5 max-w-xs">
                          {(a.applicant?.skills || []).slice(0, 4).map((s) => (
                            <span key={s} className="badge-pill text-[11px] py-0.5 px-2">
                              {s}
                            </span>
                          ))}
                          {(a.applicant?.skills || []).length > 4 && (
                            <span className="badge-pill text-[11px] py-0.5 px-2 text-[#c9c6e0]/60">
                              +{(a.applicant?.skills || []).length - 4}
                            </span>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        {a.resumeSnapshot || a.applicant?.resumeUrl ? (
                          <a
                            href={getUploadUrl(a.resumeSnapshot || a.applicant?.resumeUrl)}
                            target="_blank"
                            rel="noreferrer"
                            className="text-[#7c5cff] font-medium hover:underline text-xs"
                          >
                            View PDF
                          </a>
                        ) : (
                          <span className="text-xs text-[#c9c6e0]/50">None</span>
                        )}
                      </td>

                      <td className="px-5 py-4 text-xs text-[#c9c6e0]">
                        {formatDate(a.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        <StatusBadge status={a.status} />
                      </td>

                      <td className="px-5 py-4">
                        <StatusSelect app={a} busy={busyId === a._id} onChange={setStatus} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Stacked cards below tablet */}
          <div className="space-y-4 md:hidden">
            {apps.map((a) => {
              const aiEval = aiRankMap ? aiRankMap[a._id] : null;
              return (
                <div key={a._id} className="card-orchid space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-medium text-white">{a.applicant?.name}</p>
                      <p className="text-xs text-[#c9c6e0]">{a.applicant?.email}</p>
                    </div>
                    <StatusBadge status={a.status} />
                  </div>

                  {aiEval && (
                    <div className="rounded-xl bg-[#7c5cff]/10 border border-[#7c5cff]/25 p-3 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-semibold uppercase tracking-wider text-white">AI Match Score</span>
                        <span className="font-semibold text-[#a78bfa] text-xs">✨ {aiEval.score}%</span>
                      </div>
                      {aiEval.reason && <p className="text-xs text-[#c9c6e0] leading-snug">{aiEval.reason}</p>}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1.5">
                    {(a.applicant?.skills || []).map((s) => (
                      <span key={s} className="badge-pill text-[11px]">
                        {s}
                      </span>
                    ))}
                  </div>

                  {a.coverLetter && (
                    <p className="text-xs text-[#c9c6e0] line-clamp-3 bg-white/[0.02] p-3 rounded-lg italic border border-white/5">
                      "{a.coverLetter}"
                    </p>
                  )}

                  <div className="mt-3 flex items-center justify-between gap-2 pt-3 border-t border-white/10 text-xs">
                    {a.resumeSnapshot || a.applicant?.resumeUrl ? (
                      <a
                        href={getUploadUrl(a.resumeSnapshot || a.applicant?.resumeUrl)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[#7c5cff] font-medium underline"
                      >
                        View Resume
                      </a>
                    ) : (
                      <span className="text-[#c9c6e0]/50">No resume</span>
                    )}
                    <StatusSelect app={a} busy={busyId === a._id} onChange={setStatus} />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

function StatusSelect({ app, busy, onChange }) {
  if (app.status === 'withdrawn') return <span className="text-xs text-[#c9c6e0]/50">Withdrawn</span>;
  return (
    <select
      className="input-orchid h-9 text-xs w-auto px-2"
      value={app.status}
      disabled={busy}
      onChange={(e) => onChange(app, e.target.value)}
    >
      <option value="applied" disabled className="bg-[#12102b] text-white">
        applied
      </option>
      {NEXT.map((s) => (
        <option key={s} value={s} className="bg-[#12102b] text-white">
          {s.replace('_', ' ')}
        </option>
      ))}
    </select>
  );
}
