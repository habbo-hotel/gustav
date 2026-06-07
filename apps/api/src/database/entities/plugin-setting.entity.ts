import {Entity, Column, Index} from 'typeorm';

import {BaseEntity} from './base.entity';

@Entity('gustav_plugin_settings')
export class PluginSetting extends BaseEntity {
  @Column({name: 'plugin_name'})
  @Index({unique: true})
  pluginName!: string;

  @Column({type: 'text'})
  settings!: string;
}
