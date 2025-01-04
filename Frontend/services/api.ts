import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './tokenStorage';

const api = axios.create({
  baseURL: 'http://192.168.0.202:8080/api',
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await getAuthToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
