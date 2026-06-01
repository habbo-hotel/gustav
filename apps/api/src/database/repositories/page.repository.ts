import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {Page} from '../entities/page.entity';
import {BaseRepository} from './base.repository';

@Injectable()
export class PageRepository extends BaseRepository<Page> {
  constructor(dataSource: DataSource) {
    super(Page, dataSource);
  }

  async findByPath(path: string): Promise<Page | null> {
    return this.findOne({
      where: {path},
      relations: ['components'],
      order: {
        components: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async findWithComponents(id: number): Promise<Page | null> {
    return this.findOne({
      where: {id},
      relations: ['components'],
      order: {
        components: {
          displayOrder: 'ASC',
        },
      },
    });
  }
}
