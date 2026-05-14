import api, { setAuthToken } from './api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  nik?: string;
  kk?: string;
  address?: string;
  phone?: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN' | 'BENDAHARA' | 'USER';
  nik?: string;
  kk?: string;
  address?: string;
  phone?: string;
  photo?: string;
  isActive: boolean;
}

export const authService = {
  async login(credentials: LoginCredentials) {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      setAuthToken(response.data.token); // simpan ke memory DULU
      await AsyncStorage.setItem('authToken', response.data.token);
      await AsyncStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  async register(data: RegisterData) {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async getMe() {
    const response = await api.get('/auth/me');
    return response.data.user;
  },

  async logout() {
    setAuthToken(null); // hapus dari memory DULU
    await AsyncStorage.removeItem('authToken');
    await AsyncStorage.removeItem('user');
  },

  async getStoredToken() {
    const token = await AsyncStorage.getItem('authToken');
    if (token) setAuthToken(token); // sync ke memory saat app restart
    return token;
  },

  async getStoredUser(): Promise<User | null> {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }
};
