import {Module} from '@nestjs/common';
import {PageService} from './page.service';
import {PageController} from './page.controller';
import {PageRepository} from '../database/repositories/page.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';

@Module({
  providers: [PageService, PageRepository, PageComponentRepository],
  controllers: [PageController],
  exports: [PageService],
})
export class PageModule {}
