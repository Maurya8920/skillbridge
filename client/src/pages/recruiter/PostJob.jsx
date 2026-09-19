import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Alert, PageTitle, Spinner } from '../../components/ui';

const EMPTY = {
  title: '',
  description: '',
  jobType: 'internship',
  workMode: 'remote',
  location: '',
  skills: '',
  stipend: '',
  openings: 1,
  deadline: '',
  isActive: true,
};

export default function PostJob() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: existing, loading } = useFetch(id ? `/jobs/${id}` : null);
  const [form, setForm] = useState(EMPTY);
  const [keywords, setKeywords] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiErr, setAiErr] = useState('');

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value });

  useEffect(() => {
    if (existing) {
      setForm({
        ...EMPTY,
        ...existing,
        skills: Array.isArray(existing.skills) ? existing.skills.join(', ') : '',
        deadline: existing.deadline ? existing.deadline.slice(0, 10) : '',
      });
    }
  }, [existing]);

  const generateDescription = async () => {
    if (!form.title || form.title.trim().length < 3) return;
    setAiLoading(true);
    setAiErr('');
    try {
      const res = await api.post('/ai/job-description', {
        title: form.title,
        keywords: keywords.trim(),
        jobType: form.jobType,
        workMode: form.workMode,
      });

      const { description, skills } = res.data?.data || {};
      setForm((prev) => ({
        ...prev,
        description: description || prev.description,
        skills: Array.isArray(skills) && skills.length > 0 ? skills.join(', ') : prev.skills,
      }));
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
    const payload = {
      ...form,
      stipend: Number(form.stipend) || 0,
      openings: Number(form.openings) || 1,
      deadline: form.deadline || undefined,
    };
    try {
      if (id) await api.put(`/jobs/${id}`, payload);
      else await api.post('/jobs', payload);
      navigate('/recruiter/jobs', { state: { saved: form.title } });
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  if (!user.company && !id) {
    return (
      <div className="mx-auto max-w-xl py-6">
        <Alert type="info">
          Create your <Link to="/recruiter/company" className="underline font-medium text-white hover:text-[#7c5cff]">company profile</Link> before posting a job opening.
        </Alert>
      </div>
    );
  }

  if (loading) return <Spinner />;

  const canGenerate = Boolean(form.title && form.title.trim().length >= 3);

  return (
    <div className="mx-auto max-w-2xl py-6">
      <PageTitle
        title={id ? 'Edit Job Posting' : 'Create a Job Posting'}
        subtitle="Fill in the details or use AI to generate role descriptions and skills"
      />

      {err && (
        <div className="mb-6">
          <Alert type="error">{err}</Alert>
        </div>
      )}

      <form onSubmit={submit} className="card-orchid space-y-6">
        <div>
          <label className="label-orchid">Role Title *</label>
          <input
            className="input-orchid"
            required
            maxLength={120}
            placeholder="e.g. Frontend Engineer Intern, Full Stack Developer"
            value={form.title}
            onChange={set('title')}
          />
        </div>

        {/* AI Generator Helper Bar */}
        <div className="rounded-xl border border-[#7c5cff]/30 bg-[#7c5cff]/[0.04] p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="text-[#7c5cff]">✨</span>
              <span className="text-xs font-semibold text-white uppercase tracking-wider">AI Job Description Assistant</span>
            </div>
            <button
              type="button"
              onClick={generateDescription}
              disabled={!canGenerate || aiLoading}
              className="btn-pill-ghost btn-pill-sm gap-2"
              title={!canGenerate ? 'Enter a title with at least 3 characters' : 'Generate role description & recommended skills'}
            >
              <span>✨</span>
              <span>{aiLoading ? 'Drafting…' : 'Generate description'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <input
              type="text"
              className="input-orchid text-xs h-10"
              placeholder="Keywords / focus areas (optional, e.g. React, Next.js, REST APIs, high performance)"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
            />
          </div>

          {!canGenerate && (
            <p className="text-[11px] text-[#c9c6e0]/60">
              Type 3+ characters in the title to enable AI description generation.
            </p>
          )}

          {aiErr && (
            <div className="pt-1">
              <Alert type="error">
                <div className="flex items-center justify-between text-xs">
                  <span>{aiErr}</span>
                  <button type="button" onClick={() => setAiErr('')} className="underline font-semibold ml-2">Dismiss</button>
                </div>
              </Alert>
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="label-orchid mb-0">Job Description *</label>
            <span className="text-xs text-[#c9c6e0]/60">{form.description.length}/5000</span>
          </div>
          <div className="relative">
            <textarea
              className="textarea-orchid min-h-40 leading-relaxed"
              required
              maxLength={5000}
              placeholder="Describe candidate responsibilities, expectations, and role impact..."
              value={form.description}
              onChange={set('description')}
            />
            {aiLoading && (
              <div className="absolute inset-0 bg-[#12102b]/90 backdrop-blur-sm flex flex-col items-center justify-center gap-2 rounded-xl">
                <span className="h-5 w-5 rounded-full border-2 border-white/30 border-t-[#7c5cff]" />
                <p className="text-xs font-medium text-[#c9c6e0]">AI is writing the job description & extracting skills…</p>
              </div>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-orchid">Job type</label>
            <select className="input-orchid" value={form.jobType} onChange={set('jobType')}>
              {['internship', 'full-time', 'part-time', 'contract'].map((t) => (
                <option key={t} value={t} className="bg-[#12102b] text-white">{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-orchid">Work mode</label>
            <select className="input-orchid" value={form.workMode} onChange={set('workMode')}>
              {['remote', 'onsite', 'hybrid'].map((t) => (
                <option key={t} value={t} className="bg-[#12102b] text-white">{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="label-orchid">Location</label>
            <input
              className="input-orchid"
              placeholder="e.g. Bangalore, Mumbai, or Remote"
              value={form.location}
              onChange={set('location')}
            />
          </div>

          <div>
            <label className="label-orchid">Stipend / salary (₹ per month)</label>
            <input
              className="input-orchid"
              type="number"
              min="0"
              placeholder="e.g. 25000"
              value={form.stipend}
              onChange={set('stipend')}
            />
          </div>

          <div>
            <label className="label-orchid">Openings</label>
            <input
              className="input-orchid"
              type="number"
              min="1"
              value={form.openings}
              onChange={set('openings')}
            />
          </div>

          <div>
            <label className="label-orchid">Deadline</label>
            <input
              className="input-orchid"
              type="date"
              value={form.deadline}
              onChange={set('deadline')}
            />
          </div>
        </div>

        <div>
          <label className="label-orchid">Required Skills (comma separated)</label>
          <input
            className="input-orchid"
            placeholder="react, node.js, mongodb, typescript"
            value={form.skills}
            onChange={set('skills')}
          />
          <p className="mt-2 text-xs text-[#c9c6e0]/60">
            Skills are automatically populated when using the AI generator, or you can edit them manually.
          </p>
        </div>

        {id && (
          <label className="flex items-center gap-2.5 text-sm text-[#c9c6e0] cursor-pointer select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-white/20 bg-[#12102b] text-[#7c5cff] focus:ring-[#7c5cff]"
              checked={form.isActive}
              onChange={set('isActive')}
            />
            Accepting new applications
          </label>
        )}

        <div className="flex gap-4 pt-4">
          <button className="btn-pill-primary" disabled={busy}>
            {busy ? 'Saving…' : id ? 'Save changes' : 'Publish job'}
          </button>
          <Link to="/recruiter/jobs" className="btn-pill-secondary">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
