import { api } from '@/utils';
import type { User, UpdateUserPayload } from '@/types';

export const usersService = {
  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/users/me');
    return data;
  },

  updateMe: async (payload: UpdateUserPayload): Promise<User> => {
    const { data } = await api.patch<User>('/users/me', payload);
    return data;
  },
};
