import {Entity, OneToMany} from 'typeorm';

import {BaseEntity} from './base.entity';
import {PageVersion} from './page-version.entity';

@Entity('gustav_pages')
export class Page extends BaseEntity {
  @OneToMany(() => PageVersion, version => version.page, {
    cascade: true,
  })
  versions!: PageVersion[];
}
