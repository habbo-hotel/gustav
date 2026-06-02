import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {Page} from '../entities/page.entity';
import {BaseRepository} from './base.repository';

@Injectable()
export class PageRepository extends BaseRepository<Page> {
  constructor(dataSource: DataSource) {
    super(Page, dataSource);
  }
}
