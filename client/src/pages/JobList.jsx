import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import useFetch from '../hooks/useFetch';
import { useAuth } from '../context/AuthContext';
import JobCard from '../components/JobCard';
import { Spinner, EmptyState, ErrorState, Pagination, PageTitle } from '../components/ui';

const JOB_TYPES = ['internship', 'full-time', 'part-time', 'contract'];
const WORK_MODES = ['remote', 'onsite', 'hybrid'];

export default function JobList() {
  const { user } = useAuth();
  const [sp, setSp] = useSearchParams();
  const filters = {
    keyword: sp.get('keyword') || '',
    jobType: sp.get('jobType') || '',
    workMode: sp.get('workMode') || '',
    location: sp.get('location') || '',
    minStipend: sp.get('minStipend') || '',
    page: Number(sp.get('page') || 1),
    limit: 9,
  };
  const [draft, setDraft] = useState({ keyword: filters.keyword, location: filters.location, minStipend: filters.minStipend });

  const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== '' && v !== undefined));
  const { data, pagination, loading, error, refetch } = useFetch('/jobs', params, [sp.toString()]);

  const update = (patch) => {
    const next = { ...filters, ...patch, page: patch.page || 1 };
    setSp(Object.fromEntries(Object.entries(next).filter(([k, v]) => v && k !== 'limit')));
  };
  const submitSearch = (e) => {
    e.preventDefault();
    update(draft);
  };
  const clear = () => {
    setDraft({ keyword: '', location: '', minStipend: '' });
    setSp({});
  };

  return (
    <div className="py-6">
      <PageTitle title="Browse Jobs" subtitle={pagination ? `${pagination.total} openings available` : ''} />
      <form onSubmit={submitSearch} className="card-orchid mb-8 grid gap-4 md:grid-cols-6 min-w-0">
        <input
          className="input-orchid md:col-span-2 min-w-0"
          placeholder="Search title, skill, keyword…"
          value={draft.keyword}
          onChange={(e) => setDraft({ ...draft, keyword: e.target.value })}
        />
        <input
          className="input-orchid min-w-0"
          placeholder="Location"
          value={draft.location}
          onChange={(e) => setDraft({ ...draft, location: e.target.value })}
        />
        <input
          className="input-orchid min-w-0"
          type="number"
          min="0"
          placeholder="Min stipend ₹"
          value={draft.minStipend}
          onChange={(e) => setDraft({ ...draft, minStipend: e.target.value })}
        />
        <select
          className="input-orchid min-w-0"
          value={filters.jobType}
          onChange={(e) => update({ jobType: e.target.value })}
        >
          <option value="" className="bg-[#12102b] text-white">All types</option>
          {JOB_TYPES.map((t) => (
            <option key={t} value={t} className="bg-[#12102b] text-white capitalize">{t}</option>
          ))}
        </select>
        <select
          className="input-orchid min-w-0"
          value={filters.workMode}
          onChange={(e) => update({ workMode: e.target.value })}
        >
          <option value="" className="bg-[#12102b] text-white">All modes</option>
          {WORK_MODES.map((t) => (
            <option key={t} value={t} className="bg-[#12102b] text-white capitalize">{t}</option>
          ))}
        </select>
        <div className="flex flex-wrap gap-3 md:col-span-6 pt-2">
          <button className="btn-pill-primary">Search</button>
          <button type="button" onClick={clear} className="btn-pill-secondary">Clear</button>
        </div>
      </form>

      {loading ? (
        <Spinner />
      ) : error ? (
        <ErrorState message={error} onRetry={refetch} />
      ) : !data?.length ? (
        <EmptyState title="No jobs match your filters" hint="Try a broader keyword or clear the filters." />
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {data.map((j) => (
              <JobCard key={j._id} job={j} userSkills={user?.skills || []} />
            ))}
          </div>
          <Pagination page={pagination.page} pages={pagination.pages} onChange={(p) => update({ page: p })} />
        </>
      )}
    </div>
  );
}
