import api from './api';
import { saveAuthToken, getAuthToken, deleteAuthToken } from './tokenStorage';

const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    const token: string = response.data as string;
    await saveAuthToken(token); 
    return token;
  },

  logout: async () => {
    await deleteAuthToken();
  },
};

export default authService;
