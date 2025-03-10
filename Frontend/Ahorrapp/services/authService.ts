import createApiInstance from './api';
import { deleteData, getData, saveData } from './StorageManager';

const USER_STORAGE_KEY = 'authUserInfo';
const TOKEN_STORAGE = 'authToken';

const authService = {
  login: async (email: string, password: string) => {
    email = email.toLowerCase();
    const api = await createApiInstance();
    const response = await api.post('/auth/login', { email, password });

    const { token, user } = response.data;
    console.log('Token:', token);

    await saveData(TOKEN_STORAGE, token);
    await saveData(USER_STORAGE_KEY, JSON.stringify(user));

    return { token, user };
  },

  logout: async () => {
    await deleteData(TOKEN_STORAGE);
    await deleteData(USER_STORAGE_KEY);
  },

  register: async (data: { name: string; lastname: string; email: string; password: string }) => {
    data.name = data.name.toLowerCase();
    data.lastname = data.lastname.toLowerCase();
    data.email = data.email.toLowerCase();
    
    const api = await createApiInstance();
    const response = await api.post('/auth/register', data);

    const { token, user } = response.data;
    await saveData(TOKEN_STORAGE, token);
    await saveData(USER_STORAGE_KEY, JSON.stringify(user));

    return { token, user };
  },

  verifyToken: async () => {
    const token = await getData(TOKEN_STORAGE);
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
    const userInfo = await getData(USER_STORAGE_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getHello: async () => {
    const api = await createApiInstance();
    return api.get('/auth/hello');
  }  
};

export default authService;
