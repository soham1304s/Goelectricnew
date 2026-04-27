import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as authService from '../services/authService.js';

const AuthContext = createContext(null);

// Helper: Check if token exists and is valid
const isTokenValid = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;
    return Date.now() < expiresAt;
  } catch (_) {
    return false;
  }
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isSessionValid, setIsSessionValid] = useState(false);

  const clearSession = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsSessionValid(false);
  }, []);

  const loadUser = useCallback(async () => {
    if (!isTokenValid()) {
      clearSession();
      setLoading(false);
      return;
    }
    
    try {
      const res = await authService.getMe();
      if (res.success && res.data) {
        setUser(res.data);
        setIsSessionValid(true);
      } else {
        clearSession();
      }
    } catch (_) {
      clearSession();
    } finally {
      setLoading(false);
    }
  }, [clearSession]);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  useEffect(() => {
    const handleLogout = () => {
      clearSession();
    };
    window.addEventListener('auth-logout', handleLogout);
    return () => window.removeEventListener('auth-logout', handleLogout);
  }, [clearSession]);

  // Check session validity periodically (every 5 minutes)
  useEffect(() => {
    const sessionCheckInterval = setInterval(() => {
      if (!isTokenValid()) {
        clearSession();
      }
    }, 5 * 60 * 1000); // 5 minutes
    
    return () => clearInterval(sessionCheckInterval);
  }, [clearSession]);

  const login = useCallback(async (email, password) => {
    try {
      const res = await authService.login(email, password);
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsSessionValid(true);
        return { success: true };
      }
      return { success: false, message: res.message || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.message || error.message || 'Login failed';
      return { success: false, message };
    }
  }, []);

  const adminLogin = useCallback(async (email, password) => {
    try {
      const res = await authService.adminLogin(email, password);
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsSessionValid(true);
        return { success: true };
      }
      return { success: false, message: res.message || 'Admin login failed' };
    } catch (error) {
      console.error('Admin login error:', error);
      const message = error.response?.data?.message || error.message || 'Admin login failed';
      return { success: false, message };
    }
  }, []);

  const register = useCallback(async (firstName, lastName, email, phone, password) => {
    try {
      const res = await authService.register(firstName, lastName, email, phone, password);
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsSessionValid(true);
        return { success: true };
      }
      return { success: false, message: res.message || 'Registration failed' };
    } catch (error) {
      console.error('Register error:', error);
      const message = error.response?.data?.message || error.message || 'Registration failed';
      return { success: false, message };
    }
  }, []);

  const loginWithGoogle = useCallback(async (idToken) => {
    try {
      const res = await authService.googleLogin(idToken);
      if (res.success && res.data?.token) {
        localStorage.setItem('token', res.data.token);
        localStorage.setItem('user', JSON.stringify(res.data.user));
        setUser(res.data.user);
        setIsSessionValid(true);
        return { success: true };
      }
      return { success: false, message: res.message || 'Google login failed' };
    } catch (error) {
      console.error('Google login error:', error);
      const message = error.response?.data?.message || error.message || 'Google login failed';
      return { success: false, message };
    }
  }, []);

  const logout = useCallback(() => {
    authService.logout().catch(() => {});
    clearSession();
  }, [clearSession]);

  const value = {
    user,
    loading,
    login,
    adminLogin,
    register,
    loginWithGoogle,
    logout,
    loadUser,
    isAuthenticated: !!user && isSessionValid,
    isSessionValid,
    clearSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
