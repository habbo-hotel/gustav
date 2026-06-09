import {Module} from '@nestjs/common';

import {ThemeService} from './theme.service';
import {ThemeController} from './theme.controller';
import {ThemeSettingRepository} from '../database/repositories/theme-setting.repository';
import {PageRepository} from '../database/repositories/page.repository';
import {PageVersionRepository} from '../database/repositories/page-version.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';

@Module({
  providers: [
    ThemeService,
    ThemeSettingRepository,
    PageRepository,
    PageVersionRepository,
    PageComponentRepository,
  ],
  controllers: [ThemeController],
  exports: [ThemeService],
})
export class ThemeModule {}