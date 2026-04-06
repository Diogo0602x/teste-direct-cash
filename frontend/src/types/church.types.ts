export type ScheduleType = 'MASS' | 'CONFESSION' | 'MEETING' | 'OTHER';

export type ChurchSchedule = {
  id: string;
  churchId: string;
  type: ScheduleType;
  title: string;
  daysOfWeek: number[]; // [0=Dom...6=Sáb]; vazio=sem recorrência específica
  time: string; // "HH:mm"
  description: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ChurchEvent = {
  id: string;
  churchId: string;
  title: string;
  description: string | null;
  startDate: string;
  endDate: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Church = {
  id: string;
  cnpj: string | null;
  cnpjRazaoSocial: string | null;
  cnpjNomeFantasia: string | null;
  name: string;
  description: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zipCode: string | null;
  logoUrl: string | null;
  website: string | null;
  adminId: string;
  createdAt: string;
  updatedAt: string;
};

export type ChurchWithAdmin = Church & {
  admin: {
    id: string;
    name: string;
    email: string;
    avatarUrl: string | null;
  };
  _count: {
    members: number;
  };
};

export type CnpjLookupResult = {
  cnpj: string;
  cnpjFormatted: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  name: string;
  city: string;
  state: string;
  zipCode: string | null;
};

export type CreateChurchPayload = {
  cnpj: string;
  description?: string;
  website?: string;
};

export type UpdateChurchPayload = {
  name?: string;
  description?: string;
  address?: string;
  website?: string;
  logoUrl?: string;
};

export type CreateSchedulePayload = {
  type: ScheduleType;
  title: string;
  daysOfWeek?: number[];
  time: string;
  description?: string;
};

export type CreateEventPayload = {
  title: string;
  description?: string;
  startDate: string;
  endDate?: string;
  imageUrl?: string;
};


