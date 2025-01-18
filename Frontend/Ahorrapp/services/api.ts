import axios, { InternalAxiosRequestConfig } from 'axios';
import { getAuthToken } from './tokenStorage';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Network from 'expo-network';
import { useEffect, useState } from 'react';

const LOCAL_IP = 'http://192.168.0.202:8080/api';
const PUBLIC_IP = 'http://186.137.88.141:8080/api';

let apiInstance: any = null; // Singleton instance
let baseURL: string | null;

const getPublicIp = async (): Promise<string | null> => {
  try {
    const response = await axios.get('https://api.ipify.org?format=json');
    return response.data.ip;
  } catch (error) {
    console.error('Error fetching public IP:', error);
    return null;
  }
};

const determineBaseUrl = async () => {
  try {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Location permission is required to determine the network.');
      baseURL = null;
    }

    const publicIp = await getPublicIp();
    if (!publicIp) {
      console.error('Public IP not available.');
      baseURL = null;
    }

    const backendPublicIp = PUBLIC_IP.replace(/https?:\/\//, '').split(':')[0];
    baseURL = publicIp === backendPublicIp ? LOCAL_IP : PUBLIC_IP;
  } catch (error) {
    console.error('Error determining network details:', error);
    baseURL = null;
  }
};

const createApiInstance = async () => {
  
  await determineBaseUrl();

  if (!baseURL) {
    throw new Error('Unable to determine the base URL.');
  }

  if (apiInstance && apiInstance.defaults.baseURL === baseURL) {
    return apiInstance;
  }

  console.log(`Using Base URL: ${baseURL}`);
  apiInstance = axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
  });

  apiInstance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      const token = await getAuthToken();
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    },
    (error:any) => Promise.reject(error),
  );

  return apiInstance;
};


export default createApiInstance;
