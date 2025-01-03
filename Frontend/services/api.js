import axios from 'axios';

const api = axios.create({
  baseURL: "http://localhost:8080",
  headers: { 'Content-Type': 'application/json' },
});

export const getUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};

export const getTransactions = async () => {
  try {
    const response = await api.get('/transactions');
    return response.data;
  } catch (error) {
    console.error(error);
  }
};
