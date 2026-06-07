import {PluginDefinition} from '@gustav/types';
import {registerArcturusHooks} from './web/index.js';

export * from './types/index.js';
export * from './sdk/index.js';

registerArcturusHooks();

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-arcturus-plugin',
  components: [],
  schemas: [],
};
