import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use((config) => {
  try {
    const user = JSON.parse(sessionStorage.getItem('user'));
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
  } catch (err) {
    console.error('Failed to parse user from local storage');
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export default api;
