import {Module} from '@nestjs/common';

import {PageService} from './page.service';
import {PluginService} from './plugin.service';
import {PageController} from './page.controller';
import {PluginController} from './plugin.controller';
import {PageRepository} from '../database/repositories/page.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';
import {PluginSettingRepository} from '../database/repositories/plugin-setting.repository';

@Module({
  providers: [
    PageService,
    PluginService,
    PageRepository,
    PageComponentRepository,
    PluginSettingRepository,
  ],
  controllers: [PageController, PluginController],
  exports: [PageService, PluginService],
})
export class PageModule {}
