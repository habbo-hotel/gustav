import {Module, Global} from '@nestjs/common';
import {HabboRegistry} from './habbo.registry.js';
import {HabboController} from './habbo.controller.js';

export * from './habbo.registry.js';
export * from './habbo.service.interface.js';

@Global()
@Module({
  providers: [HabboRegistry],
  controllers: [HabboController],
  exports: [HabboRegistry],
})
export class PluginBackendModule {}
