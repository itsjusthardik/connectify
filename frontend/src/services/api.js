import axios from 'axios';

// Single source of truth for API base URL
// Easy to switch between dev (localhost:5000) and production URLs
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Axios instance with base configuration
 */
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor
 * Automatically adds JWT token to Authorization header if token exists in localStorage
 * This way, every API request includes the token without manual setup
 */
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Auth API endpoints
 * - register: Create new admin account
 * - login: Authenticate admin and receive token
 * - getMe: Get current authenticated admin's profile (protected)
 */
export const authAPI = {
  register: (data) => api.post('/admin/register', data),
  login: (data) => api.post('/admin/login', data),
  getMe: () => api.get('/admin/me'),
};

export default api;
