import { Link } from 'react-router-dom';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Spinner, ErrorState, PageTitle, EmptyState, Alert } from '../../components/ui';

export default function RecruiterDashboard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useFetch('/jobs/recruiter/my-jobs');
  const jobs = data || [];
  const active = jobs.filter((j) => j.isActive).length;
  const applicants = jobs.reduce((n, j) => n + j.applicationCount, 0);

  return (
    <div className="py-6">
      <PageTitle
        title={`Welcome, ${user.name.split(' ')[0]}`}
        subtitle={user.company?.name || 'No company profile yet'}
        action={<Link to="/recruiter/post" className="btn-pill-primary">+ Post job</Link>}
      />
      {!user.company && (
        <div className="mb-6">
          <Alert type="info">
            Set up your <Link to="/recruiter/company" className="underline font-medium text-white hover:text-[#7c5cff]">company profile</Link> to start posting jobs.
          </Alert>
        </div>
      )}
      <div className="grid gap-4 sm:grid-cols-3">
        {[
          ['Total postings', jobs.length],
          ['Active', active],
          ['Total applicants', applicants],
        ].map(([l, v]) => (
          <div key={l} className="card-orchid">
            <p className="text-xs uppercase tracking-wider font-medium text-[#c9c6e0]/70">{l}</p>
            <p className="text-3xl font-semibold text-white mt-2">{loading ? '–' : v}</p>
          </div>
        ))}
      </div>
      <h2 className="mb-4 mt-10 text-xl font-medium tracking-tight text-white">Recent postings</h2>
      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !jobs.length ? (
        <EmptyState title="No postings yet" action={<Link to="/recruiter/post" className="btn-pill-primary">Post a job</Link>} />
      ) : (
        <div className="space-y-3">
          {jobs.slice(0, 5).map((j) => (
            <div key={j._id} className="card-orchid flex items-center justify-between py-4">
              <div>
                <Link to={`/jobs/${j._id}`} className="text-sm font-medium text-white hover:text-[#7c5cff] transition-colors duration-150">
                  {j.title}
                </Link>
                <p className={`text-xs mt-0.5 ${j.isActive ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {j.isActive ? 'Active' : 'Closed'}
                </p>
              </div>
              <Link to={`/recruiter/jobs/${j._id}/applicants`} className="btn-pill-ghost btn-pill-sm">
                {j.applicationCount} applicant{j.applicationCount === 1 ? '' : 's'}
              </Link>
            </div>
          ))}
          <div className="pt-2">
            <Link to="/recruiter/jobs" className="text-sm text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150">
              View all postings →
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
