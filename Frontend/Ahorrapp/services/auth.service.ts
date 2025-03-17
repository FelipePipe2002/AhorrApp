import createApiInstance from './api.service';
import { deleteData, getData, saveData } from './StorageManager.service';

const USER_STORAGE_KEY = 'authUserInfo';
const TOKEN_STORAGE = 'authToken';

const authService = {
  login: async (email: string, password: string) => {
    try {
      email = email.toLowerCase();
      const api = await createApiInstance();
      const response = await api.post('/auth/login', { email, password });

      if (!response.data?.accessToken || !response.data?.user) {
        throw new Error('Datos de autenticación inválidos.');
      }

      const { accessToken, user } = response.data;
      console.log('✅ Token recibido:', accessToken);

      await saveData(TOKEN_STORAGE, accessToken);
      await saveData(USER_STORAGE_KEY, JSON.stringify(user));

      return { accessToken, user };
    } catch (error: any) {
      console.error('❌ Error en login:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al iniciar sesión.');
    }
  },

  logout: async () => {
    try {
      const api = await createApiInstance();
      await api.post('/auth/logout', {}, { withCredentials: true }); 

      await deleteData(TOKEN_STORAGE);
      await deleteData(USER_STORAGE_KEY);

      console.log('✅ Sesión cerrada correctamente.');
    } catch (error: any) {
      console.error('❌ Error en logout:', error.response?.data || error.message);
    }
  },

  register: async (data: { name: string; lastname: string; email: string; password: string }) => {
    try {
      data.name = data.name.toLowerCase();
      data.lastname = data.lastname.toLowerCase();
      data.email = data.email.toLowerCase();

      const api = await createApiInstance();
      const response = await api.post('/auth/register', data);

      const { accessToken, user } = response.data;
      await saveData(TOKEN_STORAGE, accessToken);
      await saveData(USER_STORAGE_KEY, JSON.stringify(user));

      return { accessToken, user };
    } catch (error: any) {
      console.error('❌ Error en registro:', error.response?.data || error.message);
      throw new Error(error.response?.data?.message || 'Error al registrar usuario.');
    }
  },

  verifyToken: async () => {
    try {
      const api = await createApiInstance();
      const response = await api.get('/auth/verifyToken'); // ✅ El API ya agrega el Bearer token

      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Token inválido:', error.response?.data || error.message);
      return false;
    }
  },
  
  getUserInfo: async () => {
    const userInfo = await getData(USER_STORAGE_KEY);
    return userInfo ? JSON.parse(userInfo) : null;
  },

  getServerStatus: async () => {
    try {
      const api = await createApiInstance();
      const response = await api.get('/auth/status');
      return response.status === 200;
    } catch (error: any) {
      console.error('❌ Error al verificar el estado del servidor:', error.response?.data || error.message);
      return false;
    }
  }  
};

export default authService;
