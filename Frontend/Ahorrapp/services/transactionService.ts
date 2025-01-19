import { Transaction } from '@/models/transaction';
import createApiInstance from './api';

const transactionService = {
    getTransactionsByUser: async () => {
        const api = await createApiInstance();
        const response = await api.get('/transactions/mine');
        return response.data;
    },

    addTransaction: async (transaction: Transaction) => {
        const api = await createApiInstance();
        const response = await api.post('/transactions/add', transaction);
        return response.data;
    },

    deleteTransaction: async (id: number) => {
        const api = await createApiInstance();
        const response = await api.delete(`/transactions/delete`, { params: { id } });
        return response.data;
    },

    getCategories: async () => {
        const api = await createApiInstance();
        const response = await api.get('/transactions/categories');
        return response.data;
    }
};

export default transactionService;
