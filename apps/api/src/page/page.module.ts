import {Module} from '@nestjs/common';

import {PageService} from './page.service';
import {SchemaModule} from '../schema/schema.module';
import {PluginService} from './plugin.service';
import {PageController} from './page.controller';
import {PluginController} from './plugin.controller';
import {PageRepository} from '../database/repositories/page.repository';
import {PageVersionRepository} from '../database/repositories/page-version.repository';
import {DynamicRecordRepository} from '../database/repositories/dynamic-record.repository';
import {DynamicSchemaRepository} from '../database/repositories/dynamic-schema.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';
import {PluginSettingRepository} from '../database/repositories/plugin-setting.repository';

@Module({
  imports: [SchemaModule],
  providers: [
    PageService,
    PluginService,
    PageRepository,
    PageVersionRepository,
    PageComponentRepository,
    DynamicSchemaRepository,
    DynamicRecordRepository,
    PluginSettingRepository,
  ],
  controllers: [PageController, PluginController],
  exports: [PageService, PluginService],
})
export class PageModule {}
