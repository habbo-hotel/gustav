import {DataSource} from 'typeorm';
import {PageStatus} from '@gustav/types';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {PageVersion} from '../entities/page-version.entity';

@Injectable()
export class PageVersionRepository extends BaseRepository<PageVersion> {
  constructor(dataSource: DataSource) {
    super(PageVersion, dataSource);
  }

  async findByPath(path: string): Promise<PageVersion | null> {
    return this.findOne({
      where: {path, status: PageStatus.PUBLISHED},
      relations: ['components'],
      order: {
        components: {
          displayOrder: 'ASC',
        },
      },
    });
  }

  async findWithComponents(id: number): Promise<PageVersion | null> {
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

  async findLatestForPage(pageId: number): Promise<PageVersion | null> {
    // Try to find DRAFT first, then PUBLISHED
    const draft = await this.findOne({
      where: {pageId, status: PageStatus.DRAFT},
      relations: ['components'],
      order: {components: {displayOrder: 'ASC'}},
    });
    if (draft) return draft;

    return this.findOne({
      where: {pageId, status: PageStatus.PUBLISHED},
      relations: ['components'],
      order: {components: {displayOrder: 'ASC'}},
    });
  }
}
