import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg, getUploadUrl } from '../services/api';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import { Spinner, ErrorState, Alert } from '../components/ui';

export default function ApplyJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: job, loading, error } = useFetch(`/jobs/${id}`);
  const [coverLetter, setCoverLetter] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const generateCoverLetter = async () => {
    setAiLoading(true);
    setAiErr('');
    try {
      const res = await api.post('/ai/cover-letter', { jobId: id });
      if (res.data?.data?.coverLetter) {
        setCoverLetter(res.data.data.coverLetter);
      }
    } catch (e) {
      setAiErr(errMsg(e));
    } finally {
      setAiLoading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setErr('');
    try {
      await api.post(`/applications/${id}`, { coverLetter });
      navigate('/applications', { state: { applied: job.title } });
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <div className="card-orchid">
        <div className="border-b border-white/10 pb-5">
          <span className="badge-pill mb-3">
            Application
          </span>
          <h1 className="text-2xl font-medium tracking-tight text-white">Apply: {job.title}</h1>
          <p className="text-sm text-[#c9c6e0] mt-1">
            {job.company?.name} · {job.location || 'Anywhere'} · <span className="capitalize">{job.jobType}</span>
          </p>
        </div>

        {!user.resumeUrl && (
          <div className="mt-5">
            <Alert type="info">
              You haven't uploaded a resume yet.{' '}
              <Link to="/profile" className="font-semibold text-white underline hover:text-[#7c5cff] transition-colors duration-150">
                Upload one now
              </Link>{' '}
              to stand out to recruiters.
            </Alert>
          </div>
        )}

        {err && (
          <div className="mt-5">
            <Alert type="error">{err}</Alert>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-6">
          <div>
            <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
              <label className="label-orchid mb-0">Cover letter</label>
              <button
                type="button"
                onClick={generateCoverLetter}
                disabled={aiLoading}
                className="btn-pill-ghost btn-pill-sm gap-2"
                title="Use AI to craft a tailored cover letter from your profile"
              >
                <span>✨</span>
                <span>{aiLoading ? 'Drafting…' : 'Generate with AI'}</span>
              </button>
            </div>

            {aiErr && (
              <div className="mb-3">
                <Alert type="error">
                  <div className="flex items-center justify-between">
                    <span>{aiErr}</span>
                    <button
                      type="button"
                      onClick={() => setAiErr('')}
                      className="ml-2 text-xs font-semibold underline"
                    >
                      Dismiss
                    </button>
                  </div>
                </Alert>
              </div>
            )}

            <div className="relative">
              <textarea
                className="textarea-orchid min-h-48 font-normal leading-relaxed text-white"
                maxLength={3000}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Why are you a good fit for this role? Click 'Generate with AI' to draft a tailored letter..."
              />
              {aiLoading && (
                <div className="absolute inset-0 bg-[#12102b]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
                  <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-[#7c5cff]" />
                  <p className="text-xs font-medium text-[#c9c6e0]">AI is tailoring your cover letter…</p>
                </div>
              )}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-[#c9c6e0]/60">
              <span>Tip: You can freely edit and polish the AI-generated letter.</span>
              <span>{coverLetter.length}/3000</span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.03] p-4 text-xs text-[#c9c6e0] border border-white/10 flex items-center justify-between">
            <div>
              <span className="font-medium text-white">Resume on file:</span>{' '}
              {user.resumeUrl ? (
                <a href={getUploadUrl(user.resumeUrl)} target="_blank" rel="noreferrer" className="text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150">
                  View uploaded resume
                </a>
              ) : (
                <span className="text-[#c9c6e0]/50">None attached</span>
              )}
            </div>
            {user.skills?.length > 0 && (
              <div className="hidden sm:flex items-center gap-1.5">
                <span className="text-[#c9c6e0]/60">Your skills:</span>
                <span className="font-medium text-white">{user.skills.slice(0, 3).join(', ')}{user.skills.length > 3 ? '…' : ''}</span>
              </div>
            )}
          </div>

          <div className="flex gap-4 pt-2">
            <button className="btn-pill-primary flex-1 sm:flex-none" disabled={busy}>
              {busy ? 'Submitting…' : 'Submit application'}
            </button>
            <Link to={`/jobs/${id}`} className="btn-pill-secondary">
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
