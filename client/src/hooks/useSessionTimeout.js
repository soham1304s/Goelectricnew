import { useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

/**
 * useSessionTimeout - Auto-logout after inactivity
 * @param {number} inactivityTime - Milliseconds before auto-logout (default: 30 min)
 */
export function useSessionTimeout(inactivityTime = 30 * 60 * 1000) {
  const { isAuthenticated, logout } = useAuth();
  const timeoutRef = useRef(null);
  const warningTimeoutRef = useRef(null);

  const resetTimeout = () => {
    // Clear existing timeouts
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);

    if (!isAuthenticated) return;

    // Warn user before final logout
    warningTimeoutRef.current = setTimeout(() => {
      const confirmed = window.confirm(
        'Your session expired due to inactivity. Click OK to stay logged in or cancel to logout.'
      );
      if (!confirmed) {
        logout();
      } else {
        resetTimeout();
      }
    }, inactivityTime - 60000); // Warn 1 min before logout

    // Auto logout after inactivity
    timeoutRef.current = setTimeout(() => {
      logout();
    }, inactivityTime);
  };

  useEffect(() => {
    if (!isAuthenticated) {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      return;
    }

    const events = ['mousedown', 'keypress', 'scroll', 'touchstart', 'click'];
    const eventListener = () => resetTimeout();

    events.forEach(event => window.addEventListener(event, eventListener, true));
    resetTimeout();

    return () => {
      events.forEach(event => window.removeEventListener(event, eventListener, true));
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
    };
  }, [isAuthenticated, logout, inactivityTime]);
}

/**
 * useSessionStorage - Save data to session storage with auth check
 */
export function useSessionStorage(key, initialValue) {
  const { isAuthenticated } = useAuth();

  const getStoredValue = () => {
    if (!isAuthenticated) return initialValue;
    try {
      const item = sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const setValue = (value) => {
    if (!isAuthenticated) return;
    try {
      const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
      sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting sessionStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      sessionStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing sessionStorage key "${key}":`, error);
    }
  };

  // Clear session storage on logout
  useEffect(() => {
    if (!isAuthenticated) {
      removeValue();
    }
  }, [isAuthenticated, key]);

  return [getStoredValue(), setValue, removeValue];
}

/**
 * useLocalStorage - Save data to local storage with auth check
 */
export function useLocalStorage(key, initialValue) {
  const { isAuthenticated } = useAuth();

  const getStoredValue = () => {
    if (!isAuthenticated) return initialValue;
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  };

  const setValue = (value) => {
    if (!isAuthenticated) return;
    try {
      const valueToStore = value instanceof Function ? value(getStoredValue()) : value;
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [getStoredValue(), setValue, removeValue];
}
