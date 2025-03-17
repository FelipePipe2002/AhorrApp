import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';
import env from '@/utils/env';
import { deleteData, getData, saveData } from './StorageManager.service';

let apiInstance: AxiosInstance;
let tokenCache: string | null = null; // Cache en memoria para evitar múltiples lecturas de AsyncStorage

const createApiInstance = async (): Promise<AxiosInstance> => {

  if (apiInstance) {
    return apiInstance;
  }

  apiInstance = axios.create({
    baseURL: env.API_URL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    withCredentials: true,
  });

  tokenCache = await getData('authToken');

  apiInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      if (!tokenCache) {
        tokenCache = await getData('authToken');
      }
      if (tokenCache && config.headers) {
        config.headers.Authorization = `Bearer ${tokenCache}`;
      }
      return config;
    },
    (error: any) => Promise.reject(error),
  );

  apiInstance.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
      if (error.response?.status === 401) {
        console.log('⚠️ Token expirado, intentando renovar...');

        try {
          const refreshResponse = await axios.post(`${env.API_URL}/auth/refreshToken`, {}, { withCredentials: true });
          const newAccessToken = refreshResponse.data.accessToken;

          // Guardar el nuevo Access Token y actualizar `tokenCache`
          await saveData('authToken', newAccessToken);
          tokenCache = newAccessToken;

          // Reintentar la solicitud original con el nuevo token
          if (error.config && error.config.headers) {
            error.config.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return axios(error.config as AxiosRequestConfig);
        } catch (refreshError) {
          console.error('❌ No se pudo refrescar el token, cerrando sesión...');
          await deleteData('authToken');
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );
  return apiInstance;
};

export default createApiInstance;
