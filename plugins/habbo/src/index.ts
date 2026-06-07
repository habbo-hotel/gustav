import {PluginDefinition} from '@gustav/types';

export * from './types';
export * from './sdk/habbo.sdk';
export * from './web';

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-plugin',
  components: [],
  schemas: [],
};
