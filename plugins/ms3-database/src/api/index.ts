import {Module, Global, OnModuleInit, Inject} from '@nestjs/common';
import {
  GUSTAV_PLUGIN_SCHEMA_REGISTRY,
  PluginSchemaRegistry,
} from '@gustav/types';
import {HabboRegistry} from '@gustav/habbo-plugin/backend';
import {Ms3HabboService} from './ms3-habbo.service';

@Global()
@Module({
  providers: [Ms3HabboService],
  exports: [Ms3HabboService],
})
export class PluginBackendModule implements OnModuleInit {
  constructor(
    @Inject(GUSTAV_PLUGIN_SCHEMA_REGISTRY)
    private readonly schemaRegistry: PluginSchemaRegistry,
    private readonly habboRegistry: HabboRegistry,
    private readonly ms3Service: Ms3HabboService
  ) {}

  onModuleInit() {
    // Register as the Habbo implementation
    this.habboRegistry.registerImplementation(this.ms3Service);
    
    // Also register as a schema provider for core CMS functionality
    this.schemaRegistry.registerProvider(this.ms3Service);
  }
}
