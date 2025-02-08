import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, Platform, Alert } from 'react-native';
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
      data.transactions.sort(sortDates);
      setTransactions(data.transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  };

  const sortDates = (a: Transaction, b: Transaction) => {
    const [dayA, monthA, yearA] = a.date.split('/').map(Number);
    const [dayB, monthB, yearB] = b.date.split('/').map(Number);
    const dateA = new Date(yearA, monthA - 1, dayA);
    const dateB = new Date(yearB, monthB - 1, dayB);
    return dateB.getTime() - dateA.getTime();
  }


  //TODO: find a way to be able to call this methods without having to pass them as params
  const handleAddTransaction = async (newTransaction: Transaction) => {
    console.log("adding transaction", newTransaction);
    setTransactions((prevTransactions) => {
      const updatedTransactions = [newTransaction, ...prevTransactions];
      updatedTransactions.sort(sortDates);
      return updatedTransactions;
    });
  };

  const handleDeleteTransaction = async (id: number) => {
    console.log("deleting transaction", id);
    setTransactions(transactions.filter((t) => t.id !== id));
  }

  const handleUpdateTransaction = async (updatedTransaction: Transaction) => {
    console.log("updating transaction", updatedTransaction);
    setTransactions(transactions.map((t) => t.id === updatedTransaction.id ? updatedTransaction : t));
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
