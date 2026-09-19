import axios from 'axios';

const TOKEN_KEY = 'sb_token';

export const getToken = () => localStorage.getItem(TOKEN_KEY);
export const setToken = (t) => (t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY));

export const baseURL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({ baseURL });

// Helper to resolve resume / upload asset URLs to the backend origin.
// Strips "/api" from VITE_API_URL and prepends the server origin to relative /uploads paths.
export const getUploadUrl = (path) => {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const apiUrl = import.meta.env.VITE_API_URL || '';
  const origin = apiUrl ? apiUrl.replace(/\/api\/?$/, '') : '';
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return origin ? `${origin}${cleanPath}` : cleanPath;
};

// Attach Bearer token to every request
api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// On 401 (expired / tampered / disabled) clear the session and go to login
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;
    const url = err.config?.url || '';
    if (status === 401 && !url.includes('/auth/login') && !url.includes('/auth/register')) {
      setToken(null);
      if (window.location.pathname !== '/login') window.location.assign('/login?expired=1');
    }
    return Promise.reject(err);
  }
);

// Normalise server error into a readable message
export const errMsg = (err) =>
  err?.response?.data?.message || (axios.isCancel(err) ? '' : err?.message) || 'Something went wrong';

export default api;
