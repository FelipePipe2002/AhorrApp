import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import authService from '@/services/authService';
import GlobalText from '@/components/GlobalText';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      await authService.login(email, password);
      router.replace('/');
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <View style={styles.container}>
      <GlobalText style={styles.title}>Login</GlobalText>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} style={styles.input} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} style={styles.input} />
      <Button title="Login" onPress={handleLogin} />
      <GlobalText>{'Don\'t have an account? '}<Text style={{ color: 'blue' }} onPress={() => router.push('/register')}>Register</Text></GlobalText>
    {error ? <GlobalText style={styles.error}>{error}</GlobalText> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 8,
    borderRadius: 5,
  },
  error: {
    color: 'red',
    marginTop: 10,
  },
});
