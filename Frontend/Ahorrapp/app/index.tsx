import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Transactions from './transactions';
import Statistics from './statistics';
import Login from './login';
import Loading from './loading';
import colors from '@/utils/colors';
import appStore from '@/utils/appStore';

export default function Home() {
  const [selectedScreen, setSelectedScreen] = useState<'transactions' | 'statistics'>('transactions');
  const [, setForceUpdate] = useState(0);

  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setForceUpdate(prev => prev + 1); 
    });

    appStore.initialize(); 
    return () => unsubscribe();
  }, []);
  
  if (!appStore.isAuthenticated) {
    return <Login />;
  }

  return (
    <View style={styles.container}>
      <Header
        title={selectedScreen === 'transactions' ? 'Transactions' : 'Statistics'}
      />
      <StatusBar
        backgroundColor={colors.background}
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
        translucent
      />
      <View style={styles.content}>
        {appStore.loading ? (
          <Loading />
        ) : selectedScreen === 'transactions' ? (
          <Transactions/>
        ) : selectedScreen === 'statistics'? (
          <Statistics/>
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
});