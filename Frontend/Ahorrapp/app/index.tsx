import React, { useEffect, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, StatusBar, Platform, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import authService from '@/services/authService';
import Transactions from './transactions';
import Statistics from './statistics';
import GlobalText from '@/components/GlobalText';
import * as Updates from 'expo-updates';
import Login from './login';
import { Transaction } from '@/models/transaction';
import transactionService from '@/services/transactionService';
import { User } from '@/models/user';

export default function Home() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<'transactions' | 'statistics'>('transactions');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setLoading] = useState(true);

  //validates token
  useEffect(() => {
    const checkToken = async () => {
      const valid = await authService.verifyToken();
      setIsAuthenticated(valid);
    };

    const fetchTransactions = async () => {
      try {
        const data = await transactionService.getTransactionsByUser();
        setTransactions(data.transactions);
      } catch (error) {
        console.error('Error fetching transactions:', error);
      }
    };

    const getUser = async () => {
      try {
        const data = await authService.getUserInfo();
        setUser(data);
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    setLoading(true);
    checkToken();
    fetchTransactions();
    getUser();
    setLoading(false);
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

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
        <GlobalText style={styles.text}>Loading...</GlobalText>
      </View>
    );
  }

  if (!isAuthenticated) {
    return <Login />;
  }

  const handleLogout = async () => {
    await authService.logout();
    setIsAuthenticated(false);
  };


  return (
    <View style={styles.container}>
      <Header title={selectedScreen === 'transactions' ? 'Transactions' : 'Statistics'} showLogout={true} onLogout={handleLogout} />
      <StatusBar
        backgroundColor="#22222c"
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
        translucent
      />
      <View style={styles.content}>
        {selectedScreen === 'transactions' && user ? <Transactions transactions={transactions} user={user}/> : user && <Statistics transactions={transactions} user={user}/>}
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
