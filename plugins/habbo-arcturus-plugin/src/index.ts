import {PluginDefinition} from '@gustav/types';
import {registerArcturusHooks} from './web/index';

export * from './types/index';
export * from './sdk/index';

registerArcturusHooks();

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-arcturus-plugin',
  components: [],
  schemas: [],
};
