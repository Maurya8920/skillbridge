import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api, { errMsg } from '../../services/api';
import useFetch from '../../hooks/useFetch';
import { useAuth } from '../../context/AuthContext';
import { Alert, PageTitle, Spinner } from '../../components/ui';

const EMPTY = { name: '', industry: '', location: '', website: '', description: '' };

export default function CompanyProfile() {
  const { refresh } = useAuth();
  const navigate = useNavigate();
  const { data, loading } = useFetch('/companies/me');
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    if (data) setForm({ ...EMPTY, ...Object.fromEntries(Object.entries(data).filter(([k]) => k in EMPTY)) });
  }, [data]);

  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    setErr('');
    try {
      await api.post('/companies', form);
      await refresh();
      setMsg('Company profile saved.');
      if (!data) setTimeout(() => navigate('/recruiter/post'), 600);
    } catch (e2) {
      setErr(errMsg(e2));
    } finally {
      setBusy(false);
    }
  };

  if (loading) return <Spinner />;

  return (
    <div className="mx-auto max-w-2xl py-6">
      <PageTitle
        title="Company Profile"
        subtitle={data ? 'Update your company details' : 'Set up your company before posting jobs'}
      />
      {msg && <div className="mb-6"><Alert type="success">{msg}</Alert></div>}
      {err && <div className="mb-6"><Alert type="error">{err}</Alert></div>}
      <form onSubmit={save} className="card-orchid space-y-5">
        <div>
          <label className="label-orchid">Company name *</label>
          <input className="input-orchid" required value={form.name} onChange={set('name')} />
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label className="label-orchid">Industry</label>
            <input className="input-orchid" value={form.industry} onChange={set('industry')} />
          </div>
          <div>
            <label className="label-orchid">Location</label>
            <input className="input-orchid" value={form.location} onChange={set('location')} />
          </div>
        </div>
        <div>
          <label className="label-orchid">Website</label>
          <input className="input-orchid" type="url" placeholder="https://" value={form.website} onChange={set('website')} />
        </div>
        <div>
          <label className="label-orchid">Description</label>
          <textarea className="textarea-orchid min-h-28" maxLength={2000} value={form.description} onChange={set('description')} />
        </div>
        <button className="btn-pill-primary" disabled={busy}>
          {busy ? 'Saving…' : 'Save company'}
        </button>
      </form>
    </div>
  );
}
