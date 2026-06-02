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
  ARCHIVED = 'archived',
}

export interface PageWire {
  id: number;
  versionId?: number;
  versionNumber?: number;
  title: string;
  slug: string;
  path: string;
  status: PageStatus;
  showInNavigation: boolean;
  parentId?: number;
  parent?: PageWire;
  children?: PageWire[];
  components?: PageComponentWire[];
  hasDraft?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PageComponentWire {
  id: number;
  pageId: number;
  parentId?: number;
  pluginName: string;
  componentName: string;
  props: string;
  displayOrder: number;
}

export interface PluginSettingWire {
  id: number;
  pluginName: string;
  settings: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ComponentSchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color';
  options?: {label: string; value: any}[];
}

export interface ComponentDefinition {
  name: string;
  component: any; // Using any instead of React.FC to decouple @gustav/types from react
  description: string;
  icon?: string;
  defaultProps: Record<string, any>;
  schema: ComponentSchemaField[];
  canHaveChildren?: boolean;
}

export interface PluginDefinition {
  name: string;
  components: ComponentDefinition[];
  settingsSchema?: ComponentSchemaField[];
}
