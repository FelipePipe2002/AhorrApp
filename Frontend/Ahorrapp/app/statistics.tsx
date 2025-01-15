import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import authService from '@/services/authService';
import { useRouter } from 'expo-router';
import { deleteAuthToken } from '@/services/tokenStorage';
import GlobalText from '@/components/GlobalText';

export default function Statistics() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      let valid = await authService.verifyToken();
      if (!valid) {
        router.push('/');
        deleteAuthToken();
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
});
