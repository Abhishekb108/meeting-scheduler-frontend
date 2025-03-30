import axios from 'axios';

const API = axios.create({
  baseURL: 'https://meeting-scheduler-backend-dwlu.onrender.com/api', // Must match your backend
});

API.interceptors.request.use((req) => {
  const token = localStorage.getItem('token');
  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }
  return req;
});

export default API;