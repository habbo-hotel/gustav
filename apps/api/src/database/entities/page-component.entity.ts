import {Entity, Column, ManyToOne, JoinColumn} from 'typeorm';

import {BaseEntity} from './base.entity';
import {PageVersion} from './page-version.entity';

@Entity('gustav_page_components')
export class PageComponent extends BaseEntity {
  @Column()
  pageVersionId!: number;

  @ManyToOne(() => PageVersion, version => version.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'pageVersionId'})
  pageVersion?: PageVersion;

  @Column({nullable: true})
  parentId?: number;

  @ManyToOne(() => PageComponent, component => component.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({name: 'parentId'})
  parent?: PageComponent;

  children?: PageComponent[];

  @Column({nullable: true})
  slot?: number;

  @Column()
  pluginName!: string;

  @Column()
  componentName!: string;

  @Column({type: 'text'})
  props!: string;

  @Column({default: 0})
  displayOrder!: number;

  // Implementation requirement for PageComponentWire
  get pageId(): number {
    return this.pageVersion?.pageId || 0;
  }
}
