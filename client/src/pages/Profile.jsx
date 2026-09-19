import { useState } from 'react';
import api, { errMsg, getUploadUrl } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Alert, PageTitle } from '../components/ui';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [form, setForm] = useState({ name: user.name, phone: user.phone || '', location: user.location || '', education: user.education || '', bio: user.bio || '' });
  const [skills, setSkills] = useState(user.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const addSkill = (e) => {
    e.preventDefault();
    const s = skillInput.trim().toLowerCase();
    if (s && !skills.includes(s)) setSkills([...skills, s]);
    setSkillInput('');
  };

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setErr('');
    try {
      const r = await api.put('/auth/profile', { ...form, skills });
      setUser(r.data.data);
      setMsg('Profile saved.');
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  const upload = async (e) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setMsg('');
    setErr('');
    const fd = new FormData();
    fd.append('resume', file);
    try {
      const r = await api.post('/upload/resume', fd);
      setUser({ ...user, resumeUrl: r.data.data.resumeUrl });
      setMsg('Resume uploaded.');
      setFile(null);
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl py-6">
      <PageTitle title="My Profile" subtitle={user.email} />
      {msg && <div className="mb-6"><Alert type="success">{msg}</Alert></div>}
      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}
      <div className="grid gap-6 md:grid-cols-3">
        <form onSubmit={save} className="card-orchid space-y-5 md:col-span-2">
          <div className="grid gap-5 sm:grid-cols-2">
            <div>
              <label className="label-orchid">Name</label>
              <input className="input-orchid" required value={form.name} onChange={set('name')} />
            </div>
            <div>
              <label className="label-orchid">Phone</label>
              <input className="input-orchid" value={form.phone} onChange={set('phone')} />
            </div>
            <div>
              <label className="label-orchid">Location</label>
              <input className="input-orchid" value={form.location} onChange={set('location')} />
            </div>
            <div>
              <label className="label-orchid">Education</label>
              <input className="input-orchid" placeholder="B.Tech CSE, 2026" value={form.education} onChange={set('education')} />
            </div>
          </div>
          <div>
            <label className="label-orchid">Bio</label>
            <textarea className="textarea-orchid min-h-24" maxLength={1000} value={form.bio} onChange={set('bio')} />
          </div>
          <div>
            <label className="label-orchid">Skills</label>
            <div className="mb-3 flex flex-wrap gap-2">
              {skills.map((s) => (
                <span key={s} className="badge-pill">
                  {s}{' '}
                  <button
                    type="button"
                    onClick={() => setSkills(skills.filter((x) => x !== s))}
                    className="ml-1 text-[#c9c6e0]/60 hover:text-rose-400"
                    aria-label={`Remove ${s}`}
                  >
                    ×
                  </button>
                </span>
              ))}
              {!skills.length && <span className="text-xs text-[#c9c6e0]/50">No skills added</span>}
            </div>
            <div className="flex gap-2">
              <input
                className="input-orchid"
                placeholder="e.g. react"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && addSkill(e)}
              />
              <button type="button" onClick={addSkill} className="btn-pill-ghost btn-pill-sm">
                Add
              </button>
            </div>
          </div>
          <button className="btn-pill-primary" disabled={busy}>
            {busy ? 'Saving…' : 'Save profile'}
          </button>
        </form>

        <form onSubmit={upload} className="card-orchid space-y-4 self-start">
          <h2 className="text-base font-medium text-white">Resume</h2>
          {user.resumeUrl ? (
            <a href={getUploadUrl(user.resumeUrl)} target="_blank" rel="noreferrer" className="block text-sm text-[#7c5cff] underline hover:text-[#6a4ce6] transition-colors duration-150">
              View current resume
            </a>
          ) : (
            <p className="text-sm text-[#c9c6e0]/60">No resume uploaded.</p>
          )}
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(e) => setFile(e.target.files[0] || null)}
            className="block w-full text-xs text-[#c9c6e0] file:mr-2 file:rounded-full file:border-0 file:bg-white/10 file:text-white file:px-3 file:py-1.5 hover:file:bg-white/20 transition-colors cursor-pointer"
          />
          <p className="text-xs text-[#c9c6e0]/50">PDF, DOC or DOCX · max 2 MB</p>
          <button className="btn-pill-primary w-full" disabled={!file || uploading}>
            {uploading ? 'Uploading…' : 'Upload'}
          </button>
        </form>
      </div>
    </div>
  );
}
