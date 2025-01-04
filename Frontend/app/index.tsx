import { View, Text, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { getAuthToken } from '@/services/tokenStorage';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const checkToken = async () => {
      const token = await getAuthToken();
      if (token) {
        router.push('/transactions');
      }
    };

    checkToken();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Welcome to AhorrApp!</Text>
      <Button title="Go to Login" onPress={() => router.push('/login')} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
  },
});
