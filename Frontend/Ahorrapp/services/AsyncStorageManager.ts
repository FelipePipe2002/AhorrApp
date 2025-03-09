import AsyncStorage from '@react-native-async-storage/async-storage';

export async function saveData(key: string, value: string) {
  await AsyncStorage.setItem(key, value);
}

export async function getData(key: string): Promise<string | null> {
  return await AsyncStorage.getItem(key);
}

export async function deleteData(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function saveObject(key: string, value: object) {
  await AsyncStorage.setItem(key
    , JSON.stringify(value));
}

export async function getObject(key: string): Promise<object | null> {
  const value = await AsyncStorage.getItem(key);
  return value ? JSON.parse(value) : null;
}

export async function deleteObject(key: string) {
  await AsyncStorage.removeItem(key);
}

export async function clearStorage() {
  await AsyncStorage.clear();
}