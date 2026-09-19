import { useState } from 'react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { Spinner, EmptyState, ErrorState, PageTitle, Alert, formatDate } from '../../components/ui';
import ConfirmDialog from '../../components/ConfirmDialog';

export default function AdminJobs() {
  const { data, loading, error, refetch } = useFetch('/admin/jobs');
  const [err, setErr] = useState('');
  const [removeTarget, setRemoveTarget] = useState(null);

  const confirmRemove = async () => {
    if (!removeTarget) return;
    try {
      await api.delete(`/admin/jobs/${removeTarget._id}`);
      refetch();
    } catch (e) {
      setErr(errMsg(e));
    } finally {
      setRemoveTarget(null);
    }
  };

  return (
    <div className="py-6">
      <PageTitle title="All Jobs" subtitle={data ? `${data.length} postings` : ''} />
      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title="No jobs posted" />
      ) : (
        <div className="space-y-4">
          {data.map((j) => (
            <div key={j._id} className="card-orchid flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0">
                <Link
                  to={`/jobs/${j._id}`}
                  className="font-medium text-white hover:text-[#7c5cff] text-base transition-colors duration-150"
                >
                  {j.title}
                </Link>
                <p className="text-xs text-[#c9c6e0] mt-1">
                  {j.company?.name} · by {j.createdBy?.name} ({j.createdBy?.email}) · {formatDate(j.createdAt)} ·{' '}
                  <span className={j.isActive ? 'text-emerald-400' : 'text-rose-400'}>
                    {j.isActive ? 'Active' : 'Closed'}
                  </span>
                </p>
              </div>
              <button
                onClick={() => setRemoveTarget(j)}
                className="btn-pill-ghost btn-pill-sm text-rose-400 hover:text-rose-300 hover:border-rose-500/30 self-start sm:self-auto"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}

      {/* ConfirmDialog for removing job */}
      <ConfirmDialog
        isOpen={Boolean(removeTarget)}
        title="Remove Job Posting?"
        message={`Remove "${removeTarget?.title}" and all its applications permanently?`}
        confirmText="Yes, remove"
        cancelText="No"
        isDangerous={true}
        onConfirm={confirmRemove}
        onClose={() => setRemoveTarget(null)}
      />
    </div>
  );
}
