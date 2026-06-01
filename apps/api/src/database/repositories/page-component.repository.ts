import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {PageComponent} from '../entities/page-component.entity';
import {BaseRepository} from './base.repository';

@Injectable()
export class PageComponentRepository extends BaseRepository<PageComponent> {
  constructor(dataSource: DataSource) {
    super(PageComponent, dataSource);
  }
}
