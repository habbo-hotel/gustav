import {PageStatus} from '@gustav/types';
import {Entity, Column, ManyToOne, OneToMany, Index, JoinColumn} from 'typeorm';

import {Page} from './page.entity';
import {BaseEntity} from './base.entity';
import {PageComponent} from './page-component.entity';

@Entity('gustav_page_versions')
export class PageVersion extends BaseEntity {
  @Column()
  pageId!: number;

  @ManyToOne(() => Page, page => page.versions, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'pageId'})
  page!: Page;

  @Column({default: 1})
  versionNumber!: number;

  @Column()
  title!: string;

  @Column()
  slug!: string;

  @Column()
  path!: string;

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status!: PageStatus;

  @Column({default: true})
  showInNavigation!: boolean;

  @Column({nullable: true})
  parentId?: number;

  @ManyToOne(() => Page, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'parentId'})
  parent?: Page;

  @OneToMany(() => PageComponent, component => component.pageVersion, {
    cascade: true,
  })
  components?: PageComponent[];
}
