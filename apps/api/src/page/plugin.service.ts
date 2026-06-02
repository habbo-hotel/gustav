import {Injectable} from '@nestjs/common';
import {PluginSettingRepository} from '../database/repositories/plugin-setting.repository';
import {PluginSetting} from '../database/entities/plugin-setting.entity';

@Injectable()
export class PluginService {
  constructor(private readonly pluginSettingRepository: PluginSettingRepository) {}

  async getSettings(pluginName: string): Promise<Record<string, any>> {
    const setting = await this.pluginSettingRepository.findByName(pluginName);
    return setting ? JSON.parse(setting.settings) : {};
  }

  async updateSettings(pluginName: string, settings: Record<string, any>): Promise<PluginSetting> {
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
    
    return this.pluginSettingRepository.save(setting);
  }
}
