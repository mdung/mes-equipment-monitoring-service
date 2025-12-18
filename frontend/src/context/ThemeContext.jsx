import { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    // Check localStorage first
    const saved = localStorage.getItem('themeMode');
    return saved || 'system';
  });

  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('themeMode');
    if (saved === 'dark') return true;
    if (saved === 'light') return false;
    // Default to system preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleSystemThemeChange = (e) => {
      if (themeMode === 'system') {
        setIsDark(e.matches);
      }
    };

    // Listen for system theme changes
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    // Update theme based on current mode
    if (themeMode === 'system') {
      setIsDark(mediaQuery.matches);
    } else {
      setIsDark(themeMode === 'dark');
    }

    return () => mediaQuery.removeEventListener('change', handleSystemThemeChange);
  }, [themeMode]);

  useEffect(() => {
    // Update document class
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Save to localStorage
    localStorage.setItem('themeMode', themeMode);
  }, [isDark, themeMode]);

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode(isDark ? 'light' : 'dark');
    } else {
      setThemeMode(themeMode === 'dark' ? 'light' : 'dark');
    }
  };

  const value = {
    isDark,
    themeMode,
    toggleTheme,
    setTheme,
    theme: isDark ? 'dark' : 'light'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};