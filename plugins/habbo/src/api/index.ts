import {Module, Global} from '@nestjs/common';
import {HabboRegistry} from './habbo.registry';
import {HabboController} from './habbo.controller';

export * from './habbo.registry';
export * from './habbo.service.interface';

@Global()
@Module({
  providers: [HabboRegistry],
  controllers: [HabboController],
  exports: [HabboRegistry],
})
export class PluginBackendModule {}
