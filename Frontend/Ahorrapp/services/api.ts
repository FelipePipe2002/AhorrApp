import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './tokenStorage';
import { Platform } from 'react-native';

const LOCAL_IP = 'http://192.168.0.202:8080/api';
const PUBLIC_IP = 'http://186.137.88.141:8080/api';

const isLocalNetwork = Platform.OS === 'android' && LOCAL_IP.startsWith('192.168');


const api = axios.create({
  baseURL: "http://192.168.0.202:8080/api",
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
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

api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response);
    return response;
  },
  (error) => {
    console.error('API Error:', error.message);
    if (error.response) {
      console.log('Error Response Data:', error.response.data);
    }
    return Promise.reject(error);
  }
);


export default api;
