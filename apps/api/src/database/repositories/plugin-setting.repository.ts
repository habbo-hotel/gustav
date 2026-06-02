import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {PluginSetting} from '../entities/plugin-setting.entity';

@Injectable()
export class PluginSettingRepository extends BaseRepository<PluginSetting> {
  constructor(dataSource: DataSource) {
    super(PluginSetting, dataSource);
  }

  async findByName(pluginName: string): Promise<PluginSetting | null> {
    return this.findOne({where: {pluginName}});
  }
}
