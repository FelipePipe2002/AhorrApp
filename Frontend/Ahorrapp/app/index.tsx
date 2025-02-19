import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import authService from '@/services/authService';
import Transactions from './transactions';
import Statistics from './statistics';
import Login from './login';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transactionService';
import { User } from '@/models/user';
import Loading from './loading';
import colors from '@/utils/colors';
import ReactNativeBiometrics from 'react-native-biometrics';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<'transactions' | 'statistics'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Función para manejar la autenticación biométrica
  const handleBiometricAuth = async () => {
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
        Alert.alert('Éxito', 'Autenticación biométrica exitosa.');
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

  // Función para inicializar la aplicación (validar token y autenticación biométrica)
  const initializeApp = async () => {
    setLoading(true);
    try {
      // Verificar el token
      const valid = await authService.verifyToken();
      setIsAuthenticated(valid);

      if (valid) {
        // Solicitar autenticación biométrica
        const biometricSuccess = await handleBiometricAuth();
        if (!biometricSuccess) {
          setIsAuthenticated(false); // Si la autenticación biométrica falla, cierra la sesión
          return;
        }

        // Obtener información del usuario y transacciones
        const userData = await authService.getUserInfo();
        setUser(userData);

        await fetchTransactions();
      }
    } catch (error) {
      console.error('Error durante la inicialización:', error);
    } finally {
      setLoading(false);
    }
  };

  // Cargar datos al montar el componente
  useEffect(() => {
    initializeApp();
  }, []);

  // Función para obtener las transacciones
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactionsByUser();
      data.transactions.sort(sortDates);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error obteniendo transacciones:', error);
    } finally {
      setLoading(false);
    }
  };

  // Función para ordenar transacciones por fecha
  const sortDates = (a: Transaction, b: Transaction) => {
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  };

  // Funciones para manejar transacciones
  const handleAddTransaction = async (newTransaction: Transaction) => {
    console.log('Agregando transacción:', newTransaction);
    setTransactions((prevTransactions) => {
      const updatedTransactions = [newTransaction, ...prevTransactions];
      updatedTransactions.sort(sortDates);
      return updatedTransactions;
    });
  };

  const handleDeleteTransaction = async (id: number) => {
    console.log('Eliminando transacción:', id);
    setTransactions(transactions.filter((t) => t.id !== id));
  };

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    console.log('Actualizando transacción:', updatedTransaction);
    setTransactions(transactions.map((t) => (t.id === updatedTransaction.id ? updatedTransaction : t)));
  };

  // Funciones del header
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const handleReload = async () => {
    setLoading(true);
    await fetchTransactions();
    setLoading(false);
  };

  // Si no está autenticado, mostrar la pantalla de login
  if (!isAuthenticated) {
    return <Login />;
  }

  // Renderizar la interfaz principal
  return (
    <View style={styles.container}>
      <Header
        title={selectedScreen === 'transactions' ? 'Transactions' : 'Statistics'}
        showLogout={true}
        showReloadButton={true}
        onLogout={handleLogout}
        onReload={handleReload}
      />
      <StatusBar
        backgroundColor={colors.background}
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
        translucent
      />
      <View style={styles.content}>
        {loading ? (
          <Loading />
        ) : selectedScreen === 'transactions' && user ? (
          <Transactions
            transactions={transactions}
            user={user}
            onAddTransaction={handleAddTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onUpdateTransaction={handleUpdateTransaction}
          />
        ) : selectedScreen === 'statistics' && user ? (
          <Statistics transactions={transactions} user={user} />
        ) : null}
      </View>
      <Footer onSelect={setSelectedScreen} selectedScreen={selectedScreen} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    marginBottom: 60,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    fontSize: 16,
    color: '#000',
  },
});