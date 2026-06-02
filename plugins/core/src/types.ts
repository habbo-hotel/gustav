export interface ComponentSchemaField {
  name: string;
  label: string;
  type: 'text' | 'textarea' | 'select' | 'checkbox' | 'number' | 'color';
  options?: {label: string; value: any}[];
}

export interface ComponentDefinition {
  name: string;
  component: React.FC<any>;
  description: string;
  defaultProps: Record<string, any>;
  schema: ComponentSchemaField[];
}

export interface PluginDefinition {
  name: string;
  components: ComponentDefinition[];
  settingsSchema?: ComponentSchemaField[];
}
