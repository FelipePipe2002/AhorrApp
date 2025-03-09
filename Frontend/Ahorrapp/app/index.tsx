import React, { useEffect, useState } from 'react';
import { View, StyleSheet, StatusBar, Platform, Alert } from 'react-native';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import Transactions from './Screens/transactions';
import Statistics from './Screens/statistics';
import Loading from './Screens/loading';
import CategoryManager from './Screens/categoryManager';
import Login from './login';
import colors from '@/utils/colors';
import appStore from '@/services/appStore';

export default function Home() {
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
        title={appStore.selectedScreen}
      />
      <StatusBar
        backgroundColor={colors.background}
        barStyle={Platform.OS === 'ios' ? 'light-content' : 'default'}
        translucent
      />
      <View style={styles.content}>
        {appStore.loading ? (
          <Loading />
        ) : appStore.selectedScreen === 'Transactions' ? (
          <Transactions/>
        ) : appStore.selectedScreen === 'Statistics'? (
          <Statistics/>
        ) : appStore.selectedScreen === 'Category Manager'? (
          <CategoryManager/>
        ) : null}
      </View>
      <Footer/>
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