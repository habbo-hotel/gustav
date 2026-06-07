import {PageStatus} from '@gustav/types';
import {Entity, Column, ManyToOne, OneToMany, Index, JoinColumn} from 'typeorm';

import {Page} from './page.entity';
import {BaseEntity} from './base.entity';
import {PageComponent} from './page-component.entity';

@Entity('gustav_page_versions')
export class PageVersion extends BaseEntity {
  @Column({name: 'page_id'})
  pageId!: number;

  @ManyToOne(() => Page, page => page.versions, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'page_id'})
  page!: Page;

  @Column({default: 1, name: 'version_number'})
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

  @Column({default: true, name: 'show_in_navigation'})
  showInNavigation!: boolean;

  @Column({nullable: true, name: 'parent_id'})
  parentId?: number;

  @ManyToOne(() => Page, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'parent_id'})
  parent?: Page;

  @Column({type: 'text', nullable: true, name: 'data_view_model'})
  dataViewModel?: string | null;

  @OneToMany(() => PageComponent, component => component.pageVersion, {
    cascade: true,
  })
  components?: PageComponent[];
}
