import { api } from '@/utils';
import type { AuthUser, LoginCredentials, RegisterCredentials } from '@/types';

type AuthResponse = { accessToken: string; user: AuthUser };

export const authService = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login', credentials);
    return data;
  },

  register: async (credentials: RegisterCredentials): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/register', credentials);
    return data;
  },
};
