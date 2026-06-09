import {DataSource} from 'typeorm';
import {Injectable} from '@nestjs/common';

import {BaseRepository} from './base.repository';
import {ThemeSetting} from '../entities/theme-setting.entity';

@Injectable()
export class ThemeSettingRepository extends BaseRepository<ThemeSetting> {
  constructor(dataSource: DataSource) {
    super(ThemeSetting, dataSource);
  }

  async findActive(): Promise<ThemeSetting | null> {
    const settings = await this.find();
    return settings[0] || null;
  }
}