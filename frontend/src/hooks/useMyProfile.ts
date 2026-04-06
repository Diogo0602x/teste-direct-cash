'use client';

import { useState, useCallback, useEffect } from 'react';
import { extractErrorMessage } from '@/utils';
import { usersService } from '@/services';
import type { User } from '@/types';
import { useAuthContext } from '@/context';

type UseMyProfileReturn = {
  profile: User | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

export function useMyProfile(): UseMyProfileReturn {
  const { user: authUser, status } = useAuthContext();
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await usersService.getMe();
      setProfile(result);
    } catch (err) {
      setError(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (status === 'authenticated' && authUser) {
      void refresh();
    } else if (status === 'unauthenticated') {
      setProfile(null);
    }
  }, [status, authUser, refresh]);

  return { profile, isLoading, error, refresh };
}
