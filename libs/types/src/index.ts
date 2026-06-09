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
  dataViewModel?: string | null;
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

export interface ThemePageComponentDefinition {
  pluginName: string;
  componentName: string;
  props: Record<string, any>;
  displayOrder: number;
  parentIndex?: number;
  slot?: number;
}

export interface ThemePageDefinition {
  title: string;
  slug: string;
  path: string;
  showInNavigation: boolean;
  parentPath?: string;
  components: ThemePageComponentDefinition[];
}

export interface ThemeDefinition {
  label?: string;
  description?: string;
  previewComponent?: any;
  cssVariables?: Record<string, string>;
  darkCssVariables?: Record<string, string>;
  layout?: any;
  fontFamily?: string;
  defaultPages?: ThemePageDefinition[];
  defaultPluginSettings?: Record<string, Record<string, any>>;
}

export interface ActiveThemeWire {
  activeTheme: string | null;
}

export interface PluginDefinition {
  name: string;
  components: ComponentDefinition[];
  settingsSchema?: ComponentSchemaField[];
  schemas?: DynamicSchemaInput[];
  theme?: ThemeDefinition;
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
  folder?: string;
  fields: DynamicSchemaField[];
}

export interface DynamicSchemaWire {
  id: number | string;
  name: string;
  slug: string;
  description?: string;
  folder?: string;
  fields: DynamicSchemaField[];
  recordCount?: number;
  source?: 'internal' | 'plugin';
  pluginName?: string;
  readOnly?: boolean;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface DynamicRecordInput {
  data: Record<string, any>;
}

export interface DynamicRecordWire {
  id: number | string;
  schemaId: number | string;
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
  schemaId: number | string;
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
  loop?: LoopDefinition;
}

// Data view layout node for a schema query placed on the Data view canvas
export interface DataViewNode {
  id: string;
  schemaSlug: string;
  query?: DynamicRecordQueryInput;
  position: { x: number; y: number };
  color: string;
}

// Edge connecting a data view node to a page component
export interface DataViewEdge {
  id: string;
  sourceNodeId: string;
  targetComponentId: number;
  propBindings: DynamicPropBinding[];
}

// Loop definition owned by a component
export interface LoopDefinition {
  enabled: boolean;
  sourceNodeId: string;
  arrayField: string;
}

// Persisted on PageVersion for Data view layout
export interface DataViewModel {
  nodes: DataViewNode[];
  edges: DataViewEdge[];
}

export const GUSTAV_PLUGIN_SCHEMA_REGISTRY = 'GUSTAV_PLUGIN_SCHEMA_REGISTRY';

export interface PluginDynamicSchemaDefinition extends DynamicSchemaInput {
  pluginName: string;
  folder?: string;
  recordCount?: number;
  readOnly?: boolean;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface PluginSchemaProvider {
  pluginName: string;
  findSchemas(): Promise<PluginDynamicSchemaDefinition[]>;
  queryRecords(
    schemaSlug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire>;
  findRecord?(
    schemaSlug: string,
    id: number | string
  ): Promise<DynamicRecordWire>;
  findRecordByField?(
    schemaSlug: string,
    fieldName: string,
    value: string
  ): Promise<DynamicRecordWire>;
  createRecord?(
    schemaSlug: string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire>;
  updateRecord?(
    schemaSlug: string,
    id: number | string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire>;
  deleteRecord?(schemaSlug: string, id: number | string): Promise<void>;
}

export interface PluginSchemaRegistry {
  registerProvider(provider: PluginSchemaProvider): void;
  getProviders(): PluginSchemaProvider[];
}
