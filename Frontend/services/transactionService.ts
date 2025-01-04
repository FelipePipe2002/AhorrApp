import api from './api';

const transactionService = {
    getTransactionsByUser: async () => {
        const response = await api.get('/transactions/mine');
        return response.data;
    },
};

export default transactionService;
