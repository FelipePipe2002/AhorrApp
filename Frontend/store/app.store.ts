import { Transaction } from "@/models/transaction";
import { User } from "@/models/user";
import authService from "@/services/auth.service";
import transactionService from "@/services/transaction.service";
import { Alert } from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { clearStorage, getData } from "../services/StorageManager.service";

class AppStore {
    private static instance: AppStore;
    private listeners: (() => void)[] = [];
    isAuthenticated: boolean | null = null;
    biometricEnabled: boolean | null = false;
    selectedScreen: 'Transactions' | 'Statistics' | 'Category Manager' = 'Transactions';
    user: User | null = null;
    transactions: Transaction[] = [];
    categories: string[] = [];
    loading = true;
    serverStatus: number | null = null;

    ///Adds a listener to the store. The listener will be called whenever the store changes.
    subscribe(listener: () => void) {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    ///Notifies all listeners that the store has changed.
    private notify() {
        this.listeners.forEach(listener => listener());
    }

    //Initializes the store. This method should be called once when the app starts.
    private constructor() {
        this.checkServerStatus().then(status => {
            this.serverStatus = typeof status === 'number' ? status : null;
        });
        if (this.serverStatus === 502) {
            return;
        }
        this.initialize = this.initialize.bind(this);
        this.reload = this.reload.bind(this);
    }



    static getInstance(): AppStore {
        if (!AppStore.instance) {
            AppStore.instance = new AppStore();
        }
        return AppStore.instance;
    }

    // Authetification handler and data fetcher
    async initialize() {
        try {
            this.loading = true;
            this.notify();
            try {
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

    async checkBiometricEnabled() {
        try {
            const biometricEnabled = await getData('biometricEnabled');
            this.biometricEnabled = biometricEnabled === 'true';
        } catch (error) {
            console.error('Error al obtener el estado de la biometría:', error);
        }
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
            clearStorage();
            this.notify();
            return false;
        }
    }

    // Transaction handler
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


    async reload() {
        try {
            this.loading = true;
            this.notify();

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
            this.notify();
        }
    }

    logout() {
        this.isAuthenticated = false;
        clearStorage();
        this.notify();
    }

    checkServerStatus() {
        return authService.getServerStatus();
    }

    changeServerStatus(status: number) {
        this.serverStatus = status;
        this.notify();
    }

    // Screen handler
    selectedScreenChange(screen: 'Transactions' | 'Statistics' | 'Category Manager') {
        this.selectedScreen = screen;
        this.notify();
    }

    private sortDates(a: Transaction, b: Transaction) {
        const [dayA, monthA, yearA] = a.date.split('/').map(Number);
        const [dayB, monthB, yearB] = b.date.split('/').map(Number);
        return new Date(yearB, monthB - 1, dayB).getTime() - new Date(yearA, monthA - 1, dayA).getTime();
    }

}

export default AppStore.getInstance();
