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

export default function Home() {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<'transactions' | 'statistics'>('transactions');
  //TODO: taking into account that transactions and statistics both use the transaction, make it that index is the one that fetches the transactions and then passes them to the children components

  
  useEffect(() => {
    const checkToken = async () => {
      const valid = await authService.verifyToken();
      if (valid) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
        router.replace('/login');
      }
    };

    checkToken();
  }, []);

  const checkForUpdates = async () => {
    try {
      const update = await Updates.checkForUpdateAsync();
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        Alert.alert('Update available!', 'Restarting app to apply the update.');
        Updates.reloadAsync();
      } else {
        console.log('No update available.');
      }
    } catch (e) {
      if (e instanceof Error) {
        Alert.alert('Error', `Error checking for updates: ${e.message}`);
      } else {
        Alert.alert('Error', 'An unknown error occurred.');
      }
    }
  };
  
  
  useEffect(() => {
    checkForUpdates();
  }, []);

  if (isAuthenticated === null) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0077cc" />
        <GlobalText style={styles.text}>Loading...</GlobalText>
      </View>
    );
  }

  const handleLogout = async () => {
    await authService.logout();
    router.replace('/login');
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
      {selectedScreen === 'transactions' ? <Transactions /> : <Statistics />}
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
