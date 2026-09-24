import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('meditrackx_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Format errors & handle 401
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message =
      error.response?.data?.message ||
      error.response?.data?.errors?.[0] ||
      error.message ||
      'An unexpected error occurred';

    // If token expired, clear and redirect to login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      localStorage.removeItem('meditrackx_token');
      localStorage.removeItem('meditrackx_user');
      window.location.href = '/login?expired=true';
    }

    return Promise.reject(new Error(message));
  }
);

export default api;
