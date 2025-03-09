import { Transaction } from "@/models/transaction";
import { User } from "@/models/user";
import authService from "@/services/authService";
import transactionService from "@/services/transactionService";
import { Alert } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import AsyncStorage from "@react-native-async-storage/async-storage";

class AppStore {
    private static instance: AppStore;
    private listeners: (() => void)[] = [];
    isAuthenticated: boolean | null = null;
    biometricEnabled: boolean | null = false;
    user: User | null = null;
    transactions: Transaction[] = [];
    categories: string[] = [];
    loading = true;


    async checkBiometricEnabled() {
        try {
            const biometricEnabled = await AsyncStorage.getItem('biometricEnabled');
            this.biometricEnabled = biometricEnabled === 'true';
        } catch (error) {
            console.error('Error al obtener el estado de la biometría:', error);
        }
    }


    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify() {
        this.listeners.forEach(listener => listener());
    }
    private constructor() {
        this.initialize = this.initialize.bind(this);
        this.reload = this.reload.bind(this);
    }

    static getInstance(): AppStore {
        if (!AppStore.instance) {
            AppStore.instance = new AppStore();
        }
        return AppStore.instance;
    }

    private async handleBiometricAuth() {
        const rnBiometrics = new ReactNativeBiometrics();

        try {
            // Verifica si el dispositivo soporta autenticación biométrica
            const { available } = await rnBiometrics.isSensorAvailable();
            if (!available) {
                Alert.alert(
                    'Biometría no disponible',
                    'Tu dispositivo no soporta autenticación biométrica.'
                );
                return false;
            }

            // Solicita autenticación biométrica
            const { success } = await rnBiometrics.simplePrompt({
                promptMessage: 'Autentícate para acceder a la aplicación',
            });

            if (success) {
                return true;
            } else {
                Alert.alert('Error', 'Autenticación biométrica fallida.');
                return false;
            }
        } catch (error) {
            console.error('Error en la autenticación biométrica:', error);
            return false;
        }
    };

    async forceBiometricAuth(): Promise<boolean> {
        try {
            const biometricSuccess = await this.handleBiometricAuth();
            this.isAuthenticated = biometricSuccess;
            this.notify();
            return biometricSuccess;
        } catch (error) {
            console.error('Error en la autenticación biométrica:', error);
            this.isAuthenticated = false;
            AsyncStorage.clear();
            this.notify();
            return false;
        }
    }

    async initialize() {
        try {
            this.loading = true;
            this.notify();
            try {
                // Verificar el token
                const valid = await authService.verifyToken();
                await this.checkBiometricEnabled();
                if (valid) {
                    if (this.biometricEnabled !== false) {
                        const biometricSuccess = await this.handleBiometricAuth();
                        this.isAuthenticated = biometricSuccess;
                    } else {
                        this.isAuthenticated = true;
                    }
                    this.notify();

                    const [userInfo, transactionsData, categoriesData] = await Promise.all([
                        authService.getUserInfo(),
                        transactionService.getTransactionsByUser(),
                        transactionService.getCategories()
                    ]);

                    this.user = userInfo;
                    transactionsData.transactions.sort(this.sortDates);
                    this.transactions = transactionsData.transactions;
                    this.categories = categoriesData.categories;
                }
            } catch (error) {
                console.error('Error durante la inicialización:', error);
            } finally {
                this.loading = false;
                this.notify();
            }
        } catch (error) {
            console.error('Error en la inicialización:', error);
        }
    }

    async reloadData() {
        try {
            this.loading = true;
            this.notify(); // 🔴 Asegurarse de que esto se ejecuta

            const [transactionsData, categoriesData] = await Promise.all([
                transactionService.getTransactionsByUser(),
                transactionService.getCategories()
            ]);

            transactionsData.transactions.sort(this.sortDates);
            this.transactions = transactionsData.transactions;
            this.categories = categoriesData.categories;
        } catch (error) {
            console.error('Error al recargar los datos:', error);
        } finally {
            this.loading = false;
            this.notify(); // 🔴 Asegurarse de que esto se ejecuta después de actualizar datos
        }
    }


    addTransaction(newTransaction: Transaction) {
        this.transactions.unshift(newTransaction);
        this.transactions = [...this.transactions].sort(this.sortDates);
        if (!this.categories.includes(newTransaction.category)) {
            this.categories.push(newTransaction.category);
        }
        this.notify();
    }

    deleteTransaction(id: number) {
        this.transactions = this.transactions.filter((t) => t.id !== id);
        if (!this.transactions.some((t) => t.category === this.transactions.find((t) => t.id === id)?.category)) {
            this.categories = this.categories.filter((c) => c !== this.transactions.find((t) => t.id === id)?.category);
        }
        this.notify();
    }

    updateTransaction(updatedTransaction: Transaction) {
        const index = this.transactions.findIndex((t) => t.id === updatedTransaction.id);
        if (index !== -1) {
            if (this.transactions[index].category !== updatedTransaction.category) {
                if (!this.transactions.some((t) => t.category === this.transactions[index].category && t.id !== this.transactions[index].id)) {
                    this.categories = this.categories.filter((c) => c !== this.transactions[index].category);
                }
            }
            this.transactions = this.transactions.map(t =>
                t.id === updatedTransaction.id ? { ...updatedTransaction } : t
            );
            if (!this.categories.includes(updatedTransaction.category)) {
                this.categories.push(updatedTransaction.category);
            }
        }
        this.notify();
    }

    reload() {
        this.reloadData();
    }

    logout() {
        this.isAuthenticated = false;
        AsyncStorage.clear();
        this.notify();
    }
    private sortDates(a: Transaction, b: Transaction) {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime();
    }
}

export default AppStore.getInstance();
