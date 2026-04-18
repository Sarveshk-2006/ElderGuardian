import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login as apiLogin, register as apiRegister } from '../services/api';

const AUTH_KEY = '@auth_user';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadStoredAuth = useCallback(async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        if (data.user && data.token) {
          setUser(data.user);
          setToken(data.token);
        }
      }
    } catch (e) {
      console.warn('Auth load failed:', e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadStoredAuth();
  }, [loadStoredAuth]);

  const saveAuth = async (userData, authToken) => {
    await AsyncStorage.setItem(AUTH_KEY, JSON.stringify({ user: userData, token: authToken }));
    setUser(userData);
    setToken(authToken);
  };

  const login = async (email, password) => {
    const data = await apiLogin(email, password);
    await saveAuth(data.user, data.token);
    return data;
  };

  const register = async (email, password, name, role = 'person') => {
    const data = await apiRegister(email, password, name, role);
    await saveAuth(data.user, data.token);
    return data;
  };

  const logout = async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    setUser(null);
    setToken(null);
  };

  const isPerson = user?.role === 'person';
  const isAuthority = ['police', 'hospital', 'towing'].includes(user?.role);

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isPerson,
    isAuthority,
    authorityRole: user?.role,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
