import {PluginDefinition} from '@gustav/types';
import {registerArcturusHooks} from './web';

export * from './types';
export * from './sdk';

registerArcturusHooks();

export const plugin: PluginDefinition = {
  name: '@gustav/habbo-arcturus-plugin',
  components: [],
  schemas: [],
};
