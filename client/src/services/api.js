import axios from 'axios';

const apiRoot = (import.meta.env.VITE_API_URL || 'https://goelectricnew-production.up.railway.app').replace(/\/+$/, '');
const baseURL = apiRoot ? `${apiRoot}/api` : 'https://goelectricnew-production.up.railway.app/api';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

// Request deduplication map
const pendingRequests = new Map();

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = 'Bearer ' + token;
  // Let the browser set Content-Type (with boundary) for FormData so file uploads work
  if (config.data instanceof FormData) delete config.headers['Content-Type'];
  
  // Create a request key for deduplication (only for GET requests)
  if (config.method === 'get') {
    const requestKey = `${config.url}?${new URLSearchParams(config.params).toString()}`;
    if (pendingRequests.has(requestKey)) {
      // Return the existing promise instead of making a duplicate request
      config.cancelToken = pendingRequests.get(requestKey).token;
    }
  }
  
  return config;
});

api.interceptors.response.use(
  (r) => {
    // Clear the request from pending map on success
    if (r.config.method === 'get') {
      const requestKey = `${r.config.url}?${new URLSearchParams(r.config.params).toString()}`;
      pendingRequests.delete(requestKey);
    }
    return r;
  },
  (err) => {
    // Clear the request from pending map on error
    if (err.config && err.config.method === 'get') {
      const requestKey = `${err.config.url}?${new URLSearchParams(err.config.params).toString()}`;
      pendingRequests.delete(requestKey);
    }

    if (err.response && err.response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new CustomEvent('auth-logout'));
    }
    return Promise.reject(err);
  }
);

export default api;
