import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Alert } from '../components/ui';
import { homeFor } from '../App';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'recruiter' ? 'recruiter' : 'student';
  const [form, setForm] = useState({ name: '', email: '', password: '', role: initialRole });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  useEffect(() => {
    const r = searchParams.get('role');
    if (r === 'recruiter' || r === 'student') {
      setForm((prev) => ({ ...prev, role: r }));
    }
  }, [searchParams]);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await register(form);
      navigate(user.role === 'recruiter' ? '/recruiter/company' : homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="card-orchid">
        <h1 className="text-2xl font-medium tracking-tight text-white">Create Account</h1>
        <p className="mt-1.5 text-sm text-[#c9c6e0]">Join SkillBridge today</p>

        <div className="mt-6 grid grid-cols-2 gap-2 rounded-full bg-white/[0.04] p-1 border border-white/10">
          {['student', 'recruiter'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => setForm({ ...form, role: r })}
              className={`rounded-full py-2 text-sm font-medium capitalize transition-colors duration-150 ${
                form.role === r ? 'bg-[#7c5cff] text-white' : 'text-[#c9c6e0] hover:text-white'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="label-orchid">Full name</label>
            <input
              className="input-orchid"
              required
              placeholder="Your name"
              value={form.name}
              onChange={set('name')}
            />
          </div>
          <div>
            <label className="label-orchid">Email address</label>
            <input
              className="input-orchid"
              type="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={set('email')}
            />
          </div>
          <div>
            <label className="label-orchid">Password (min 6 characters)</label>
            <input
              className="input-orchid"
              type="password"
              minLength={6}
              required
              placeholder="••••••••"
              value={form.password}
              onChange={set('password')}
            />
          </div>
          <button className="btn-pill-primary w-full mt-2" disabled={busy}>
            {busy ? 'Creating…' : `Sign up as ${form.role}`}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#c9c6e0]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
