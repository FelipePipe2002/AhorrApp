import axios, { InternalAxiosRequestConfig } from 'axios';
import env from '@/utils/env';
import { getData } from './StorageManager';

let apiInstance: any = null; // Singleton instance

const createApiInstance = async () => {

  if (apiInstance) {
    return apiInstance;
  }

  apiInstance = axios.create({
    baseURL: env.API_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  apiInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getData('authToken');
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
