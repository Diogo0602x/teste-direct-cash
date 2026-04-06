export type HealthResponse = {
  status: "ok" | "error";
  timestamp: string;
  version: string;
};

export type JwtPayload = {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = {
  user: JwtPayload;
};

export type PaginationParams = {
  page: number;
  limit: number;
};

export type PaginatedResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
