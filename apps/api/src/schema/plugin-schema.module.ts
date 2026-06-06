import {Global, Module} from '@nestjs/common';
import {GUSTAV_PLUGIN_SCHEMA_REGISTRY} from '@gustav/types';

import {PluginSchemaRegistryService} from './plugin-schema-registry.service';

@Global()
@Module({
  providers: [
    PluginSchemaRegistryService,
    {
      provide: GUSTAV_PLUGIN_SCHEMA_REGISTRY,
      useExisting: PluginSchemaRegistryService,
    },
  ],
  exports: [PluginSchemaRegistryService, GUSTAV_PLUGIN_SCHEMA_REGISTRY],
})
export class PluginSchemaModule {}
