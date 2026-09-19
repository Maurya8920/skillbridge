import { useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { errMsg } from '../services/api';
import { Alert } from '../components/ui';
import { homeFor } from '../App';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setError('');
    try {
      const user = await login(form.email, form.password);
      navigate(location.state?.from || homeFor(user.role), { replace: true });
    } catch (err) {
      setError(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md py-12">
      <div className="card-orchid">
        <h1 className="text-2xl font-medium tracking-tight text-white">Sign In</h1>
        <p className="mt-1.5 text-sm text-[#c9c6e0]">Welcome back to SkillBridge</p>

        {params.get('expired') && (
          <div className="mt-4">
            <Alert type="info">Your session expired. Please log in again.</Alert>
          </div>
        )}
        {error && (
          <div className="mt-4">
            <Alert type="error">{error}</Alert>
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-5">
          <div>
            <label className="label-orchid">Email address</label>
            <input
              className="input-orchid"
              type="email"
              required
              placeholder="name@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="label-orchid">Password</label>
            <input
              className="input-orchid"
              type="password"
              required
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>
          <button className="btn-pill-primary w-full mt-2" disabled={busy}>
            {busy ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-[#c9c6e0]">
          Don't have an account?{' '}
          <Link to="/register" className="text-[#7c5cff] font-medium underline hover:text-[#6a4ce6] transition-colors duration-150">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
