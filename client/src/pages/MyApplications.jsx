import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api, { errMsg } from '../services/api';
import useFetch from '../hooks/useFetch';
import { Spinner, EmptyState, ErrorState, StatusBadge, PageTitle, Alert, formatDate } from '../components/ui';
import ConfirmDialog from '../components/ConfirmDialog';

export default function MyApplications() {
  const location = useLocation();
  const { data, loading, error, refetch } = useFetch('/applications/my');
  const [msg, setMsg] = useState(location.state?.applied ? `Application submitted for "${location.state.applied}".` : '');
  const [err, setErr] = useState('');
  const [withdrawTarget, setWithdrawTarget] = useState(null);

  const confirmWithdraw = async () => {
    if (!withdrawTarget) return;
    try {
      await api.patch(`/applications/${withdrawTarget._id}/withdraw`);
      setMsg('Application withdrawn.');
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setWithdrawTarget(null);
    }
  };

  return (
    <div className="py-6">
      <PageTitle title="My Applications" subtitle={data ? `${data.length} total` : ''} />
      {msg && <div className="mb-6"><Alert type="success">{msg}</Alert></div>}
      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState
          title="You haven't applied anywhere yet"
          action={<Link to="/jobs" className="btn-pill-primary">Browse jobs</Link>}
        />
      ) : (
        <div className="space-y-4">
          {data.map((a) => (
            <div key={a._id} className="card-orchid flex flex-wrap items-center justify-between gap-4">
              <div>
                <Link
                  to={`/jobs/${a.job?._id}`}
                  className="font-medium text-white hover:text-[#7c5cff] transition-colors duration-150 text-lg"
                >
                  {a.job?.title || 'Job removed'}
                </Link>
                <p className="text-sm text-[#c9c6e0] mt-1">
                  {a.job?.company?.name} · {a.job?.location} · Applied {formatDate(a.createdAt)}
                </p>
                {a.note && <p className="mt-2 text-xs text-[#c9c6e0]/70 italic">Recruiter note: {a.note}</p>}
              </div>
              <div className="flex items-center gap-4">
                <StatusBadge status={a.status} />
                {['applied', 'under_review', 'shortlisted'].includes(a.status) && (
                  <button
                    onClick={() => setWithdrawTarget(a)}
                    className="text-xs text-rose-400 underline hover:text-rose-300 transition-colors duration-150"
                  >
                    Withdraw
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ConfirmDialog for withdraw application */}
      <ConfirmDialog
        isOpen={Boolean(withdrawTarget)}
        title="Withdraw Application?"
        message={`Are you sure you want to withdraw your application for "${withdrawTarget?.job?.title || 'this position'}"? This action cannot be undone.`}
        confirmText="Yes, withdraw"
        cancelText="No"
        isDangerous={true}
        onConfirm={confirmWithdraw}
        onClose={() => setWithdrawTarget(null)}
      />
    </div>
  );
}
