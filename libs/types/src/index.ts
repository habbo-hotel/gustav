export interface UserWire {
  id: number;
  username: string;
  email: string;
  isSuperAdmin: boolean;
}

export interface RegisterInput {
  email: string;
  username: string;
  password?: string;
}

export interface LoginInput {
  email: string;
  password?: string;
}

export interface HealthWire {
  status: string;
  timestamp: string;
}

export interface AdminStatsWire {
  totalUsers: number;
  activeSessions: number;
  systemHealth: string;
}
