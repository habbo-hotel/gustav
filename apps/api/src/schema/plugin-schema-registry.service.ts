import {Injectable} from '@nestjs/common';
import {PluginSchemaProvider, PluginSchemaRegistry} from '@gustav/types';

@Injectable()
export class PluginSchemaRegistryService implements PluginSchemaRegistry {
  private readonly providers = new Map<string, PluginSchemaProvider>();

  registerProvider(provider: PluginSchemaProvider): void {
    this.providers.set(provider.pluginName, provider);
  }

  getProviders(): PluginSchemaProvider[] {
    return [...this.providers.values()];
  }
}
