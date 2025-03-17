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
import appStore from '@/store/app.store';
import { checkForUpdate, downloadAndInstallUpdate } from '@/services/update.service';
import { UpdateModal } from '@/components/UpdateModal';

export default function Home() {
  const [, setForceUpdate] = useState(0);
  const [updateModalVisible, setUpdateModalVisible] = useState(false);
  const [updateInfo, setUpdateInfo] = useState<{
    versionName: string;
    releaseNotes: string;
    apkUrl: string;
  } | null>(null);

  // Subscribe to appStore changes
  useEffect(() => {
    const unsubscribe = appStore.subscribe(() => {
      setForceUpdate(prev => prev + 1);
    });

    appStore.initialize();
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const checkUpdate = async () => {
      const { updateAvailable, versionName, releaseNotes, apkUrl } = await checkForUpdate();
      if (updateAvailable) {
        setUpdateInfo({ versionName, releaseNotes, apkUrl });
        setUpdateModalVisible(true);
      }
    };

    checkUpdate();
  }, []);

  useEffect(() => {
    const checkServerStatus = async () => {
      try {
        const serverStatus = await appStore.checkServerStatus();
        console.log('Server status:', serverStatus);

      }
      catch (error) {
        Alert.alert('Error', 'Failed to connect to server');
      }
    }

    checkServerStatus();
  }, []);


  const handleUpdate = () => {
    if (updateInfo) {
      downloadAndInstallUpdate(updateInfo.apkUrl);
      setUpdateModalVisible(false);
    }
  };

  const handleCancel = () => {
    setUpdateModalVisible(false);
  };

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
          <Transactions />
        ) : appStore.selectedScreen === 'Statistics' ? (
          <Statistics />
        ) : appStore.selectedScreen === 'Category Manager' ? (
          <CategoryManager />
        ) : null}
      </View>
      <UpdateModal
        visible={updateModalVisible}
        versionName={updateInfo?.versionName || ''}
        releaseNotes={updateInfo?.releaseNotes || ''}
        onUpdate={handleUpdate}
        onCancel={handleCancel}
      />
      <Footer />
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