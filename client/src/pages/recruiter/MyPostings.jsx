import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Spinner, EmptyState, ErrorState, PageTitle, Alert, formatINR, formatDate } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function MyPostings() {
  const location = useLocation();
  const { data, loading, error, refetch } = useFetch('/jobs/recruiter/my-jobs');
  const [msg, setMsg] = useState(location.state?.saved ? `"${location.state.saved}" saved.` : '');
  const [err, setErr] = useState('');
  const [deleteTarget, setDeleteTarget] = useState(null);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await api.delete(`/jobs/${deleteTarget._id}`);
      setMsg('Job deleted.');
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setDeleteTarget(null);
    }
  };

  const toggle = async (job) => {
    try {
      await api.put(`/jobs/${job._id}`, { isActive: !job.isActive });
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    }
  };

  return (
    <div className="py-6">
      <PageTitle
        title="My Postings"
        subtitle={data ? `${data.length} jobs` : ''}
        action={<Link to="/recruiter/post" className="btn-pill-primary">+ Post job</Link>}
      />
      {msg && <div className="mb-6"><Alert type="success">{msg}</Alert></div>}
      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="You haven't posted any jobs"
          action={<Link to="/recruiter/post" className="btn-pill-primary">Post your first job</Link>}
        />
      ) : (
        <div className="space-y-4">
          {data.map((j) => (
            <div key={j._id} className="card-orchid flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2.5">
                  <Link
                    to={`/jobs/${j._id}`}
                    className="font-medium text-white hover:text-[#7c5cff] text-lg transition-colors duration-150"
                  >
                    {j.title}
                  </Link>
                  <span
                    className={`badge-pill text-xs ${
                      j.isActive
                        ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-[#c9c6e0]/60'
                    }`}
                  >
                    {j.isActive ? 'Active' : 'Closed'}
                  </span>
                </div>
                <p className="text-sm text-[#c9c6e0] mt-1">
                  {j.jobType} · {j.workMode} · {j.location || 'Anywhere'} · {formatINR(j.stipend)} · Deadline {formatDate(j.deadline)}
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  to={`/recruiter/jobs/${j._id}/applicants`}
                  className="btn-pill-primary btn-pill-sm"
                >
                  {j.applicationCount} applicant{j.applicationCount === 1 ? '' : 's'}
                </Link>
                <Link to={`/recruiter/jobs/${j._id}/edit`} className="btn-pill-ghost btn-pill-sm">
                  Edit
                </Link>
                <button onClick={() => toggle(j)} className="btn-pill-ghost btn-pill-sm">
                  {j.isActive ? 'Close' : 'Reopen'}
                </button>
                <button
                  onClick={() => setDeleteTarget(j)}
                  className="btn-pill-ghost btn-pill-sm text-rose-400 hover:text-rose-300 hover:border-rose-500/30"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Reusable ConfirmDialog for deleting job */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title="Delete Job Posting?"
        message={`Delete "${deleteTarget?.title}" and all its applications? This action cannot be undone.`}
        confirmText="Yes, delete"
        cancelText="No"
        isDangerous={true}
        onConfirm={confirmDelete}
        onClose={() => setDeleteTarget(null)}
      />
    </div>
  );
}
