export type AdminChurch = {
  id: string;
  name: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
  bio: string | null;
  avatarUrl: string | null;
  createdAt: string;
  updatedAt: string;
  adminChurch: AdminChurch | null;
};

export type UpdateUserPayload = {
  name?: string;
  email?: string;
  bio?: string;
  avatarUrl?: string;
};
