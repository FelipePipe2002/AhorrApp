import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, Platform, Alert } from 'react-native';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import authService from '@/services/authService';
import Transactions from './transactions';
import Statistics from './statistics';
import * as Updates from 'expo-updates';
import Login from './login';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transactionService';
import { User } from '@/models/user';
import Loading from './loading';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<'transactions' | 'statistics'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  //handles the transactions
  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const data = await transactionService.getTransactionsByUser();
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddTransaction = async (newTransaction: Transaction) => {
    setTransactions((prevTransactions) => [newTransaction, ...prevTransactions]);
  };

  const handleDeleteTransaction = async (id: number) => {
    setTransactions(transactions.filter((t) => t.id !== id));
  }


  //validates token
  useEffect(() => {
    const initialize = async () => {
      setLoading(true);
      try {
        const valid = await authService.verifyToken();
        setIsAuthenticated(valid);

        if (valid) {
          const data = await authService.getUserInfo();
          setUser(data);

          await fetchTransactions();
        }
      } catch (error) {
        console.error('Error during initialization:', error);
      } finally {
        setLoading(false);
      }
    };

    initialize();
  }, []);

  //checks for updates
  useEffect(() => {
    const checkForUpdates = async () => {
      try {
        const update = await Updates.checkForUpdateAsync();
        if (update.isAvailable) {
          await Updates.fetchUpdateAsync();
          Alert.alert('Update available!', 'Restarting app to apply the update.');
          Updates.reloadAsync();
        }
      } catch (e) {
        if (e instanceof Error) {
          Alert.alert('Error', `Error checking for updates: ${e.message}`);
        } else {
          Alert.alert('Error', 'An unknown error occurred.');
        }
      }
    };
    checkForUpdates();
    const interval = setInterval(checkForUpdates, 10000); // 10 seconds
    return () => clearInterval(interval);
  }, []);


  //header functions
  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };

  const handleReload = async () => {
    setLoading(true);
    await fetchTransactions();
    setLoading(false);
  };


  if (!isAuthenticated) {
    return <Login />;
  }

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
        backgroundColor="#22222c"
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
    backgroundColor: '#242b3e',
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
