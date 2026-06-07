import {PluginDefinition} from '@gustav/types';

export * from './types/index.js';
export * from './sdk/habbo.sdk.js';
export * from './web/index.js';

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-plugin',
  components: [],
  schemas: [],
};
