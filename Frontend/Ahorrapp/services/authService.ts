import AsyncStorage from '@react-native-async-storage/async-storage';
import { deleteAuthToken, getAuthToken, saveAuthToken } from './tokenStorage';
import createApiInstance from './api';

const USER_STORAGE_KEY = 'authUserInfo';

const authService = {
  login: async (email: string, password: string) => {
    const api = await createApiInstance();
    const response = await api.post('/auth/login', { email, password });

    const { token, user } = response.data;
    await saveAuthToken(token);

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { token, user };
  },

  logout: async () => {
    await deleteAuthToken();
    await AsyncStorage.removeItem(USER_STORAGE_KEY);
  },

  register: async (data: { name: string; lastname: string; email: string; password: string }) => {
    const api = await createApiInstance();
    const response = await api.post('/auth/register', data);

    const { token, user } = response.data;
    await saveAuthToken(token);

    await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));

    return { token, user };
  },

  verifyToken: async () => {
    const token = await getAuthToken();
    if (!token) {
      console.log('No token found');
      return false;
    }

    try {
      const api = await createApiInstance();
      await api.get('/auth/verifyToken');
      return true;
    } catch (error) {
      console.log('Error verifying token:', error);
      return false;
    }
  },

  getUserInfo: async () => {
    const userInfo = await AsyncStorage.getItem(USER_STORAGE_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getHello: async () => {
    const api = await createApiInstance();
    return api.get('/auth/hello');
  }  
};

export default authService;
