import {Entity, Column} from 'typeorm';

import {BaseEntity} from './base.entity';

@Entity('gustav_theme_settings')
export class ThemeSetting extends BaseEntity {
  @Column({name: 'active_theme', type: 'varchar', length: '255', nullable: true})
  activeTheme!: string | null;
}