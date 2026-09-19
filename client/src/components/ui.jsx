// Shared UI pieces for Orchid dark theme: loading / empty / error states, badges, pagination

export const Spinner = ({ label = 'Loading…' }) => (
  <div className="flex items-center justify-center gap-3 py-16 text-[#c9c6e0]">
    <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-[#7c5cff]" />
    <span className="text-sm font-medium">{label}</span>
  </div>
);

export const EmptyState = ({ title = 'Nothing here yet', hint, action }) => (
  <div className="card-orchid text-center py-16">
    <p className="text-xl font-medium text-white">{title}</p>
    {hint && <p className="mt-2 text-sm text-[#c9c6e0] max-w-md mx-auto">{hint}</p>}
    {action && <div className="mt-6">{action}</div>}
  </div>
);

export const ErrorState = ({ message, onRetry }) => (
  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-5 text-sm text-rose-300">
    <p className="font-medium">{message || 'Something went wrong.'}</p>
    {onRetry && (
      <button
        onClick={onRetry}
        className="mt-2.5 text-xs font-semibold underline hover:text-white transition-colors duration-150"
      >
        Try again
      </button>
    )}
  </div>
);

export const Alert = ({ type = 'info', children }) => {
  const styles = {
    info: 'bg-[#7c5cff]/10 text-[#c9c6e0] border-[#7c5cff]/30',
    success: 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30',
    error: 'bg-rose-500/10 text-rose-300 border-rose-500/30',
  }[type] || 'bg-white/5 text-[#c9c6e0] border-white/10';

  return <div className={`rounded-2xl border p-4 text-sm leading-relaxed ${styles}`}>{children}</div>;
};

const STATUS_STYLES = {
  applied: 'bg-[#7c5cff]/15 text-[#a78bfa] border-[#7c5cff]/30',
  under_review: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  shortlisted: 'bg-purple-500/15 text-purple-300 border-purple-500/30',
  selected: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  rejected: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
  withdrawn: 'bg-white/[0.08] text-white/60 border-white/10',
};

export const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium capitalize border ${
      STATUS_STYLES[status] || 'bg-white/5 text-[#c9c6e0] border-white/10'
    }`}
  >
    {String(status).replace('_', ' ')}
  </span>
);

export const Pagination = ({ page, pages, onChange }) => {
  if (pages <= 1) return null;
  return (
    <div className="flex items-center justify-center gap-3 pt-6">
      <button
        className="btn-pill-ghost btn-pill-sm"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        Prev
      </button>
      <span className="text-sm font-medium text-[#c9c6e0]">
        Page {page} of {pages}
      </span>
      <button
        className="btn-pill-ghost btn-pill-sm"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
      >
        Next
      </button>
    </div>
  );
};

export const PageTitle = ({ title, subtitle, action }) => (
  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-3xl font-medium tracking-tight text-white">{title}</h1>
      {subtitle && <p className="mt-1.5 text-sm text-[#c9c6e0]">{subtitle}</p>}
    </div>
    {action}
  </div>
);

export const formatINR = (n) => (n ? `₹${Number(n).toLocaleString('en-IN')}` : 'Unpaid');
export const formatDate = (d) => (d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
