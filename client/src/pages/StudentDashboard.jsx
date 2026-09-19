import { Link } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { Spinner, ErrorState, StatusBadge, PageTitle, EmptyState } from '../components/ui';

export default function StudentDashboard() {
  const { user } = useAuth();
  const apps = useFetch('/applications/my');
  const jobs = useFetch('/jobs', { limit: 6, keyword: user.skills?.[0] || '' });

  const counts = (apps.data || []).reduce((acc, a) => ({ ...acc, [a.status]: (acc[a.status] || 0) + 1 }), {});
  const done = [user.resumeUrl, user.skills?.length, user.education, user.location].filter(Boolean).length;

  return (
    <div className="py-6">
      <PageTitle title={`Hi, ${user.name.split(' ')[0]}`} subtitle="Your internship search at a glance" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          ['Applied', apps.data?.length ?? '–'],
          ['Under review', counts.under_review || 0],
          ['Shortlisted', counts.shortlisted || 0],
          ['Selected', counts.selected || 0],
        ].map(([l, v]) => (
          <div key={l} className="card-orchid">
            <p className="text-xs uppercase tracking-wider font-medium text-[#c9c6e0]/70">{l}</p>
            <p className="text-3xl font-semibold text-white mt-2">{v}</p>
          </div>
        ))}
      </div>

      {done < 4 && (
        <div className="mt-6 rounded-2xl border border-[#7c5cff]/30 bg-[#7c5cff]/10 p-4 text-sm text-[#c9c6e0] flex items-center justify-between flex-wrap gap-2">
          <span>
            Your profile is <strong className="text-white">{Math.round((done / 4) * 100)}%</strong> complete. Add details to improve AI skill matching.
          </span>
          <Link to="/profile" className="btn-pill-ghost btn-pill-sm">
            Complete Profile
          </Link>
        </div>
      )}

      <div className="mt-10 grid gap-8 lg:grid-cols-2">
        <section>
          <h2 className="mb-4 text-xl font-medium tracking-tight text-white">Recent applications</h2>
          {apps.loading ? (
            <Spinner />
          ) : apps.error ? (
            <ErrorState message={apps.error} onRetry={apps.refetch} />
          ) : !apps.data?.length ? (
            <EmptyState title="No applications yet" action={<Link to="/jobs" className="btn-pill-primary">Find jobs</Link>} />
          ) : (
            <div className="space-y-3">
              {apps.data.slice(0, 5).map((a) => (
                <div key={a._id} className="card-orchid flex items-center justify-between py-4">
                  <Link to={`/jobs/${a.job?._id}`} className="text-sm font-medium text-white hover:text-[#7c5cff] transition-colors duration-150">
                    {a.job?.title}
                  </Link>
                  <StatusBadge status={a.status} />
                </div>
              ))}
              <div className="pt-2">
                <Link to="/applications" className="text-sm text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150">
                  View all applications →
                </Link>
              </div>
            </div>
          )}
        </section>

        <section>
          <h2 className="mb-4 text-xl font-medium tracking-tight text-white">Recommended for you</h2>
          {jobs.loading ? (
            <Spinner />
          ) : jobs.error ? (
            <ErrorState message={jobs.error} />
          ) : !jobs.data?.length ? (
            <EmptyState title="No matching jobs right now" />
          ) : (
            <div className="space-y-4">
              {jobs.data.slice(0, 4).map((j) => (
                <JobCard key={j._id} job={j} userSkills={user.skills || []} />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
