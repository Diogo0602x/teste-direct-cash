import { api } from '@/utils';
import type {
  Church,
  ChurchWithAdmin,
  ChurchSchedule,
  ChurchEvent,
  ChurchMember,
  CnpjLookupResult,
  CreateChurchPayload,
  UpdateChurchPayload,
  CreateSchedulePayload,
  CreateEventPayload,
  PaginatedResponse,
} from '@/types';

export const churchesService = {
  list: async (page: number, limit: number): Promise<PaginatedResponse<Church>> => {
    const { data } = await api.get<PaginatedResponse<Church>>('/churches', {
      params: { page, limit },
    });
    return data;
  },

  getById: async (id: string): Promise<ChurchWithAdmin> => {
    const { data } = await api.get<ChurchWithAdmin>(`/churches/${id}`);
    return data;
  },

  create: async (payload: CreateChurchPayload): Promise<Church> => {
    const { data } = await api.post<Church>('/churches', payload);
    return data;
  },

  update: async (id: string, payload: UpdateChurchPayload): Promise<Church> => {
    const { data } = await api.patch<Church>(`/churches/${id}`, payload);
    return data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/churches/${id}`);
  },

  lookupCnpj: async (cnpj: string): Promise<CnpjLookupResult> => {
    const { data } = await api.get<CnpjLookupResult>(`/churches/lookup-cnpj/${cnpj}`);
    return data;
  },

  getSchedules: async (churchId: string): Promise<ChurchSchedule[]> => {
    const { data } = await api.get<ChurchSchedule[]>(`/churches/${churchId}/schedules`);
    return data;
  },

  createSchedule: async (
    churchId: string,
    payload: CreateSchedulePayload,
  ): Promise<ChurchSchedule> => {
    const { data } = await api.post<ChurchSchedule>(
      `/churches/${churchId}/schedules`,
      payload,
    );
    return data;
  },

  deleteSchedule: async (churchId: string, scheduleId: string): Promise<void> => {
    await api.delete(`/churches/${churchId}/schedules/${scheduleId}`);
  },

  getEvents: async (churchId: string): Promise<ChurchEvent[]> => {
    const { data } = await api.get<ChurchEvent[]>(`/churches/${churchId}/events`);
    return data;
  },

  createEvent: async (
    churchId: string,
    payload: CreateEventPayload,
  ): Promise<ChurchEvent> => {
    const { data } = await api.post<ChurchEvent>(`/churches/${churchId}/events`, payload);
    return data;
  },

  deleteEvent: async (churchId: string, eventId: string): Promise<void> => {
    await api.delete(`/churches/${churchId}/events/${eventId}`);
  },

  getMembers: async (
    churchId: string,
    page: number,
    limit: number,
  ): Promise<PaginatedResponse<ChurchMember>> => {
    const { data } = await api.get<PaginatedResponse<ChurchMember>>(
      `/churches/${churchId}/members`,
      { params: { page, limit } },
    );
    return data;
  },

  getRequests: async (churchId: string): Promise<ChurchMember[]> => {
    const { data } = await api.get<ChurchMember[]>(`/churches/${churchId}/requests`);
    return data;
  },

  approveMember: async (churchId: string, userId: string): Promise<void> => {
    await api.patch(`/churches/${churchId}/members/${userId}/approve`);
  },

  rejectMember: async (churchId: string, userId: string): Promise<void> => {
    await api.patch(`/churches/${churchId}/members/${userId}/reject`);
  },

  updateMemberRole: async (
    churchId: string,
    userId: string,
    role: 'ADMIN' | 'MEMBER',
  ): Promise<void> => {
    await api.patch(`/churches/${churchId}/members/${userId}/role`, { role });
  },

  removeMember: async (churchId: string, userId: string): Promise<void> => {
    await api.delete(`/churches/${churchId}/members/${userId}`);
  },

  join: async (churchId: string): Promise<ChurchMember> => {
    const { data } = await api.post<ChurchMember>(`/churches/${churchId}/join`);
    return data;
  },

  addAdmin: async (churchId: string, email: string): Promise<void> => {
    await api.post(`/churches/${churchId}/add-admin`, { email });
  },
};
