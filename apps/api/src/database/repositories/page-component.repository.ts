import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {PageComponent} from '../entities/page-component.entity';

@Injectable()
export class PageComponentRepository extends BaseRepository<PageComponent> {
  constructor(dataSource: DataSource) {
    super(PageComponent, dataSource);
  }
}
