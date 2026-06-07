import {Module, Global, OnModuleInit, Inject} from '@nestjs/common';
import {
  GUSTAV_PLUGIN_SCHEMA_REGISTRY,
  PluginSchemaRegistry,
} from '@gustav/types';
import {HabboRegistry} from '@gustav/habbo-plugin/backend';
import {ArcturusHabboService} from './arcturus-habbo.service.js';

@Global()
@Module({
  providers: [ArcturusHabboService],
  exports: [ArcturusHabboService],
})
export class PluginBackendModule implements OnModuleInit {
  constructor(
    @Inject(GUSTAV_PLUGIN_SCHEMA_REGISTRY)
    private readonly schemaRegistry: PluginSchemaRegistry,
    private readonly habboRegistry: HabboRegistry,
    private readonly arcturusService: ArcturusHabboService
  ) {}

  onModuleInit() {
    // Register as the Habbo implementation
    this.habboRegistry.registerImplementation(this.arcturusService);
    
    // Also register as a schema provider for core CMS functionality
    this.schemaRegistry.registerProvider(this.arcturusService);
  }
}
