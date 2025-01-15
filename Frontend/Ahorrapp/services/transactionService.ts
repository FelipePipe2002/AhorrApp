import { Transaction } from '@/models/transaction';
import api from './api';

const transactionService = {
    getTransactionsByUser: async () => {
        const response = await api.get('/transactions/mine');
        return response.data;
    },

    addTransaction: async (transaction: Transaction) => {
        const response = await api.post('/transactions/add', transaction);
        return response.data;
    },

    deleteTransaction: async (id: number) => {
        const response = await api.delete(`/transactions/delete`, { params: { id } });
        return response.data;
    }
};

export default transactionService;
