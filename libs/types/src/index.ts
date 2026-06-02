export interface UserWire {
  id: number;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isSuperAdmin: boolean;
  createdAt?: Date | string;
}

export interface CreateUserInput {
  email: string;
  username: string;
  firstName?: string;
  lastName?: string;
  isSuperAdmin?: boolean;
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

export enum PageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
}

export interface PageWire {
  id: number;
  title: string;
  slug: string;
  path: string;
  status: PageStatus;
  parentId?: number;
  parent?: PageWire;
  children?: PageWire[];
  components?: PageComponentWire[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PageComponentWire {
  id: number;
  pageId: number;
  pluginName: string;
  componentName: string;
  props: string; // Stored as serialized string for now based on user preference against JSON columns
  displayOrder: number;
}

export interface PluginSettingWire {
  id: number;
  pluginName: string;
  settings: string; // Serialized JSON
  createdAt: Date | string;
  updatedAt: Date | string;
}
