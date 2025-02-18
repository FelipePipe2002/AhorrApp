import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './tokenStorage';

let apiInstance: any = null; // Singleton instance

const createApiInstance = async () => {

  if (apiInstance) {
    return apiInstance;
  }

  apiInstance = axios.create({
    baseURL: process.env.REACT_APP_API_BASE_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  apiInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error:any) => Promise.reject(error),
  );

  return apiInstance;
};


export default createApiInstance;
