import useFetch from '../../hooks/useFetch';
import { Spinner, ErrorState, PageTitle, StatusBadge } from '../../components/ui';

export default function AdminStats() {
  const { data, loading, error, refetch } = useFetch('/admin/stats');
  if (loading) return <Spinner />;
  if (error) return <ErrorState message={error} onRetry={refetch} />;

  const tiles = [
    ['Students', data.students],
    ['Recruiters', data.recruiters],
    ['Companies', data.companies],
    ['Jobs', data.jobs],
    ['Active jobs', data.activeJobs],
    ['Applications', data.applications],
  ];

  return (
    <div className="py-6">
      <PageTitle title="Platform Stats" subtitle="SkillBridge global system metrics" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([l, v]) => (
          <div key={l} className="card-orchid">
            <p className="text-xs uppercase tracking-wider font-medium text-[#c9c6e0]/70">{l}</p>
            <p className="text-3xl font-semibold text-white mt-2">{v}</p>
          </div>
        ))}
      </div>

      <h2 className="mb-4 mt-10 text-xl font-medium tracking-tight text-white">Applications by status</h2>
      <div className="card-orchid flex flex-wrap gap-5">
        {Object.entries(data.applicationsByStatus).length ? (
          Object.entries(data.applicationsByStatus).map(([s, n]) => (
            <div key={s} className="flex items-center gap-2.5">
              <StatusBadge status={s} />
              <span className="font-medium text-white">{n}</span>
            </div>
          ))
        ) : (
          <p className="text-sm text-[#c9c6e0]/60">No applications yet.</p>
        )}
      </div>
    </div>
  );
}
