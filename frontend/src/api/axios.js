import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const url = error.config?.url || '';

    if (status === 401) {
      // Let auth slice handle /auth/me failures — avoid redirect loops
      const isAuthRoute = url.includes('/auth/me') || url.includes('/auth/login') || url.includes('/auth/register');
      if (!isAuthRoute) {
        localStorage.removeItem('token');
        const onAuthPage = ['/login', '/register', '/forgot-password'].some((p) =>
          window.location.pathname.startsWith(p)
        );
        if (!onAuthPage) {
          window.location.href = '/login';
        }
      }
    }

    if (status === 429) {
      error.message = 'Too many requests. Please wait a moment and try again.';
    }

    return Promise.reject(error);
  }
);

export default api;
