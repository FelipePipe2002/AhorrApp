import { Transaction } from '@/models/transaction';
import createApiInstance from './api.service';

const transactionService = {
    getTransactionsByUser: async () => {
        const api = await createApiInstance();
        const response = await api.get('/transactions/mine');
        return response.data;
    },

    addTransaction: async (transaction: Transaction) => {
        transaction.category = transaction.category.toLowerCase();
        const api = await createApiInstance();
        const response = await api.post('/transactions/add', transaction);
        return response.data;
    },

    updateTransaction: async (transaction: Transaction) => {
        transaction.category = transaction.category.toLowerCase();
        const api = await createApiInstance();
        const response = await api.put('/transactions/update', transaction);
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
    },

    changeCategoriesTo: async (newCategory: string, oldCategories: string[]) => {
        newCategory = newCategory.toLowerCase();
        oldCategories = oldCategories.map(category => category.toLowerCase());
        const api = await createApiInstance();
        const response = await api.post('/transactions/change-categories', { newCategory, oldCategories });
        return response.data;
    },
};

export default transactionService;
