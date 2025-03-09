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

//TODO modificar este js para que se encargue de todo el tema de storage en el telefono, ej, authToken, o usar biometrica
//fijate que en authservice usa asyncstorage para guardar el usuario logueado y trata de unificarlo por que llamadas asi
// away Async quedan feas