/// <reference types="vite/client" />

declare module 'virtual:gustav-plugins' {
  import {PluginDefinition} from '@gustav/types';
  export const plugins: PluginDefinition[];
}
