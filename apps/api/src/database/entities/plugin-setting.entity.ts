import {Entity, Column, Index} from 'typeorm';
import {PluginSettingWire} from '@gustav/types';

import {BaseEntity} from './base.entity';

@Entity('gustav_plugin_settings')
export class PluginSetting extends BaseEntity implements PluginSettingWire {
  @Column()
  @Index({unique: true})
  pluginName!: string;

  @Column({type: 'text'})
  settings!: string;
}
