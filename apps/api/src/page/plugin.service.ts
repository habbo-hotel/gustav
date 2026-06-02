import {Injectable} from '@nestjs/common';
import {PluginSettingWire} from '@gustav/types';

import {PluginSetting} from '../database/entities/plugin-setting.entity';
import {PluginSettingRepository} from '../database/repositories/plugin-setting.repository';

@Injectable()
export class PluginService {
  constructor(
    private readonly pluginSettingRepository: PluginSettingRepository
  ) {}

  async getSettings(pluginName: string): Promise<Record<string, any>> {
    const setting = await this.pluginSettingRepository.findByName(pluginName);
    return setting ? JSON.parse(setting.settings) : {};
  }

  async updateSettings(
    pluginName: string,
    settings: Record<string, any>
  ): Promise<PluginSettingWire> {
    let setting = await this.pluginSettingRepository.findByName(pluginName);
    const settingsStr = JSON.stringify(settings);

    if (setting) {
      setting.settings = settingsStr;
    } else {
      setting = this.pluginSettingRepository.create({
        pluginName,
        settings: settingsStr,
      });
    }

    const saved = await this.pluginSettingRepository.save(setting);
    return this.mapToWire(saved);
  }

  private mapToWire(setting: PluginSetting): PluginSettingWire {
    return {
      id: setting.id,
      pluginName: setting.pluginName,
      settings: setting.settings,
      createdAt: setting.createdAt,
      updatedAt: setting.updatedAt,
    };
  }
}
