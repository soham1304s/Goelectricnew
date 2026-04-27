import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext(null);

const STORAGE_KEY = 'goelectriq-theme';

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  });

  useEffect(() => {
    const root = document.documentElement;
    const metaTheme = document.querySelector('meta[name="theme-color"]');
    if (theme === 'dark') {
      root.classList.add('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#000000');
    } else {
      root.classList.remove('dark');
      if (metaTheme) metaTheme.setAttribute('content', '#ffffff');
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
