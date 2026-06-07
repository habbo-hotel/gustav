import {PluginDefinition} from '@gustav/types';

export * from './types/index';
export * from './sdk/habbo.sdk';
export * from './web/index';

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-plugin',
  components: [],
  schemas: [],
};
