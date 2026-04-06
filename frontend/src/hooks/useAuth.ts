'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/context';
import { extractErrorMessage } from '@/utils';
import type { LoginCredentials, RegisterCredentials } from '@/types';

type UseAuthReturn = {
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
};

export function useAuth(): UseAuthReturn {
  const { login: ctxLogin, register: ctxRegister, logout: ctxLogout } = useAuthContext();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = useCallback(
    async (credentials: LoginCredentials): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await ctxLogin(credentials);
        router.push('/dashboard');
      } catch (err: unknown) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [ctxLogin, router],
  );

  const register = useCallback(
    async (credentials: RegisterCredentials): Promise<void> => {
      setIsLoading(true);
      setError(null);
      try {
        await ctxRegister(credentials);
        router.push('/dashboard');
      } catch (err: unknown) {
        setError(extractErrorMessage(err));
      } finally {
        setIsLoading(false);
      }
    },
    [ctxRegister, router],
  );

  const logout = useCallback((): void => {
    ctxLogout();
    router.push('/login');
  }, [ctxLogout, router]);

  return { isLoading, error, login, register, logout };
}
