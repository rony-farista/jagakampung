import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://172.16.4.9:5000/api';

// Token disimpan di memory agar interceptor tidak delay (race condition fix)
let memoryToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  memoryToken = token;
};

export const getAuthToken = () => memoryToken;

const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(async (config) => {
  // Baca dari memory dulu, fallback ke AsyncStorage
  const token = memoryToken || await AsyncStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
    if (!memoryToken) memoryToken = token; // sync ke memory jika dari storage
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      memoryToken = null;
      await AsyncStorage.removeItem('authToken');
      await AsyncStorage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export default api;
