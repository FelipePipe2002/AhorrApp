import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveAuthToken(token: string) {
  await AsyncStorage.setItem('authToken', token);
}

export async function getAuthToken(): Promise<string | null> {
  return await AsyncStorage.getItem('authToken');
}

export async function deleteAuthToken() {
  await AsyncStorage.removeItem('authToken');
}
