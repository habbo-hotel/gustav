import {PageWire, PageStatus} from '@gustav/types';
import {Entity, Column, ManyToOne, OneToMany, Index, JoinColumn} from 'typeorm';

import {BaseEntity} from './base.entity';
import {PageComponent} from './page-component.entity';

@Entity('gustav_pages')
export class Page extends BaseEntity implements PageWire {
  @Column()
  title!: string;

  @Column()
  @Index({unique: true})
  slug!: string;

  @Column()
  @Index({unique: true})
  path!: string;

  @Column({
    type: 'enum',
    enum: PageStatus,
    default: PageStatus.DRAFT,
  })
  status!: PageStatus;

  @Column({nullable: true})
  parentId?: number;

  @ManyToOne(() => Page, page => page.children, {onDelete: 'SET NULL'})
  @JoinColumn({name: 'parentId'})
  parent?: Page;

  @OneToMany(() => Page, page => page.parent)
  children?: Page[];

  @OneToMany(() => PageComponent, component => component.page, {
    cascade: true,
  })
  components?: PageComponent[];
}
