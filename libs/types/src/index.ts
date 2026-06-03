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
  slot?: number;
  pluginName: string;
  componentName: string;
  props: string;
  bindings?: string | null;
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

export type DynamicSchemaFieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'checkbox'
  | 'date'
  | 'select';

export interface DynamicSchemaField {
  name: string;
  label: string;
  type: DynamicSchemaFieldType;
  required?: boolean;
  options?: {label: string; value: string}[];
}

export interface DynamicSchemaInput {
  name: string;
  slug: string;
  description?: string;
  fields: DynamicSchemaField[];
}

export interface DynamicSchemaWire {
  id: number;
  name: string;
  slug: string;
  description?: string;
  fields: DynamicSchemaField[];
  recordCount?: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DynamicRecordInput {
  data: Record<string, any>;
}

export interface DynamicRecordWire {
  id: number;
  schemaId: number;
  data: Record<string, any>;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DynamicSchemaDependencyWire {
  type: 'record' | 'page-component' | 'template-hook';
  label: string;
  count: number;
}

export interface DynamicSchemaDeleteCheckWire {
  schemaId: number;
  dependencies: DynamicSchemaDependencyWire[];
  dependencyCount: number;
  canDelete: boolean;
}

export interface DynamicRecordQueryInput {
  limit?: number;
  offset?: number;
  sortField?: string;
  sortDirection?: 'ASC' | 'DESC';
  filters?: Record<string, any>;
}

export interface DynamicRecordQueryWire {
  records: DynamicRecordWire[];
  total: number;
}

export interface DynamicSchemaQueryWire {
  name: string;
  singleName: string;
  schemaSlug: string;
  schemaName: string;
  fields: DynamicSchemaField[];
}

export interface DynamicPropBinding {
  propName: string;
  fieldName: string;
  fallback?: any;
}

export interface DynamicComponentBindings {
  enabled?: boolean;
  query?: DynamicRecordQueryInput & {
    schemaSlug: string;
  };
  propBindings?: DynamicPropBinding[];
}
