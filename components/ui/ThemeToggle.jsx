'use client';

import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../../context/AppContext';

export default function ThemeToggle({ className = '' }) {
  const { theme, toggleTheme, ready } = useTheme();
  return (
    <button type="button" className={`icon-button ${className}`} onClick={toggleTheme} aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'} title={theme === 'dark' ? 'Light mode' : 'Dark mode'}>
      {ready && theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
    </button>
  );
}
