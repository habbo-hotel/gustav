import {Entity, Column, ManyToOne, JoinColumn} from 'typeorm';
import {PageComponentWire} from '@gustav/types';

import {BaseEntity} from './base.entity';
import {Page} from './page.entity';

@Entity('gustav_page_components')
export class PageComponent extends BaseEntity implements PageComponentWire {
  @Column()
  pageId!: number;

  @ManyToOne(() => Page, (page) => page.components, {onDelete: 'CASCADE'})
  @JoinColumn({name: 'pageId'})
  page?: Page;

  @Column()
  pluginName!: string;

  @Column()
  componentName!: string;

  @Column({type: 'text'})
  props!: string;

  @Column({default: 0})
  displayOrder!: number;
}
