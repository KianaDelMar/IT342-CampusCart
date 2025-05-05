import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Add a request interceptor to include JWT token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  error => {
    if (error.response && error.response.status === 401) {
      sessionStorage.removeItem('token');
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);

export default api;
