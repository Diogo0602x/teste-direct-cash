'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import { authService } from '@/services';
import { useToast } from './ToastContext';
import type { AuthUser, AuthStatus, LoginCredentials, RegisterCredentials } from '@/types';

type AuthContextValue = {
  user: AuthUser | null;
  status: AuthStatus;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

type AuthProviderProps = {
  children: React.ReactNode;
};

export function AuthProvider({ children }: AuthProviderProps): React.JSX.Element {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const { success: showSuccess } = useToast();

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    const stored = localStorage.getItem('auth_user');

    if (token && stored) {
      try {
        const parsed = JSON.parse(stored) as AuthUser;
        setUser(parsed);
        setStatus('authenticated');
      } catch {
        localStorage.removeItem('access_token');
        localStorage.removeItem('auth_user');
        setStatus('unauthenticated');
      }
    } else {
      setStatus('unauthenticated');
    }
  }, []);

  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    const data = await authService.login(credentials);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
    setStatus('authenticated');
    showSuccess(`Bem-vindo de volta, ${data.user.name.split(' ')[0]}!`);
  }, [showSuccess]);

  const register = useCallback(async (credentials: RegisterCredentials): Promise<void> => {
    const data = await authService.register(credentials);
    localStorage.setItem('access_token', data.accessToken);
    localStorage.setItem('auth_user', JSON.stringify(data.user));
    setUser(data.user);
    setStatus('authenticated');
    showSuccess(`Conta criada com sucesso! Bem-vindo, ${data.user.name.split(' ')[0]}!`);
  }, [showSuccess]);

  const logout = useCallback((): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('auth_user');
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  return (
    <AuthContext.Provider value={{ user, status, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuthContext(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuthContext deve ser usado dentro de <AuthProvider>');
  }
  return ctx;
}
