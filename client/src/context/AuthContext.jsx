import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import api, { getToken, setToken } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // true until /auth/me resolves

  useEffect(() => {
    let cancelled = false;
    if (!getToken()) { setLoading(false); return; }
    api.get('/auth/me')
      .then((r) => { if (!cancelled) setUser(r.data.data); })
      .catch(() => { if (!cancelled) { setToken(null); setUser(null); } })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const login = useCallback(async (email, password) => {
    const r = await api.post('/auth/login', { email, password });
    setToken(r.data.data.token);
    setUser(r.data.data.user);
    return r.data.data.user;
  }, []);

  const register = useCallback(async (payload) => {
    const r = await api.post('/auth/register', payload);
    setToken(r.data.data.token);
    setUser(r.data.data.user);
    return r.data.data.user;
  }, []);

  const logout = useCallback(() => { setToken(null); setUser(null); }, []);
  const refresh = useCallback(async () => { const r = await api.get('/auth/me'); setUser(r.data.data); }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refresh, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
