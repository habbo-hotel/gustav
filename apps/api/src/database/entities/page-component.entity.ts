import {Entity, Column, ManyToOne, JoinColumn} from 'typeorm';

import {BaseEntity} from './base.entity';
import {PageVersion} from './page-version.entity';

@Entity('gustav_page_components')
export class PageComponent extends BaseEntity {
  @Column({name: 'page_version_id'})
  pageVersionId!: number;

  @ManyToOne(() => PageVersion, version => version.components, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({name: 'page_version_id'})
  pageVersion?: PageVersion;

  @Column({nullable: true, name: 'parent_id'})
  parentId?: number;

  @ManyToOne(() => PageComponent, component => component.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({name: 'parent_id'})
  parent?: PageComponent;

  children?: PageComponent[];

  @Column({nullable: true})
  slot?: number;

  @Column({name: 'plugin_name'})
  pluginName!: string;

  @Column({name: 'component_name'})
  componentName!: string;

  @Column({type: 'text'})
  props!: string;

  @Column({type: 'text', nullable: true})
  bindings?: string | null;

  @Column({default: 0, name: 'display_order'})
  displayOrder!: number;

  // Implementation requirement for PageComponentWire
  get pageId(): number {
    return this.pageVersion?.pageId || 0;
  }
}
