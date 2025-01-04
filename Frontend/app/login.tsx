import React, { useState } from 'react';
import { View, TextInput, Button, Text } from 'react-native';
import authService from '../services/authService';
import { useRouter } from 'expo-router';
import { getAuthToken } from '@/services/tokenStorage';
import { useEffect } from 'react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
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
  
  const handleLogin = async () => {
    try {
      await authService.login(email, password);
      router.push('/transactions'); 
    } catch {
      setError('Invalid email or password');
    }
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Password" secureTextEntry value={password} onChangeText={setPassword} />
      <Button title="Login" onPress={handleLogin} />
      {error ? <Text>{error}</Text> : null}
    </View>
  );
}
