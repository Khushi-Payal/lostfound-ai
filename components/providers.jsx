'use client';

import { AuthProvider, ThemeProvider, ToastProvider } from '../context/AppContext';
import { ToastViewport } from './ui/ToastViewport';

export function Providers({ children }) {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          {children}
          <ToastViewport />
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
