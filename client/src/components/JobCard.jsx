import { Link } from 'react-router-dom';
import { formatINR } from './ui';

export default function JobCard({ job, userSkills = [] }) {
  const matched = (job.skills || []).filter((s) => userSkills.includes(s)).length;
  const companyInitial = (job.company?.name || job.title || 'S').charAt(0).toUpperCase();

  return (
    <Link
      to={`/jobs/${job._id}`}
      className="card-orchid block hover:border-[#7c5cff]/60 hover:bg-white/[0.06] transition-colors duration-150 group text-left"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3.5">
          <div className="h-10 w-10 flex-shrink-0 rounded-xl bg-gradient-to-tr from-[#7c5cff] to-[#a78bfa] text-white font-bold flex items-center justify-center text-sm shadow-md">
            {companyInitial}
          </div>
          <div>
            <h3 className="font-medium text-base text-white group-hover:text-[#7c5cff] transition-colors duration-150 line-clamp-1">
              {job.title}
            </h3>
            <p className="text-xs text-[#c9c6e0] mt-0.5">
              {job.company?.name || 'Company'} · {job.location || 'Anywhere'}
            </p>
          </div>
        </div>
        <span className="badge-pill font-medium text-[#7c5cff] border-[#7c5cff]/30 bg-[#7c5cff]/10">
          {formatINR(job.stipend)}{job.stipend ? '/mo' : ''}
        </span>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5">
        <span className="badge-pill capitalize text-[11px]">
          {job.jobType}
        </span>
        <span className="badge-pill capitalize text-[11px]">
          {job.workMode}
        </span>
        {(job.skills || []).slice(0, 3).map((s) => (
          <span
            key={s}
            className={`badge-pill text-[11px] ${
              userSkills.includes(s)
                ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30 font-semibold'
                : ''
            }`}
          >
            {userSkills.includes(s) && '✓ '}{s}
          </span>
        ))}
        {(job.skills || []).length > 3 && (
          <span className="badge-pill text-[11px] text-[#c9c6e0]/60">
            +{(job.skills || []).length - 3}
          </span>
        )}
      </div>

      {userSkills.length > 0 && (job.skills || []).length > 0 && (
        <div className="mt-3.5 pt-3 border-t border-white/10 flex items-center justify-between text-[11px]">
          <span className="text-[#c9c6e0]/70">Skill Match</span>
          <span className="font-semibold text-emerald-400">
            {matched}/{job.skills.length} skills ({Math.round((matched / job.skills.length) * 100)}%)
          </span>
        </div>
      )}
    </Link>
  );
}
