import {Controller, Get, Post, Body, Param} from '@nestjs/common';
import {PluginService} from './plugin.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';

@Controller('plugins')
export class PluginController {
  constructor(private readonly pluginService: PluginService) {}

  @Get(':name/settings')
  async getSettings(@Param('name') name: string) {
    return this.pluginService.getSettings(name);
  }

  @Post(':name/settings')
  @IsSuperAdmin()
  async updateSettings(@Param('name') name: string, @Body() settings: Record<string, any>) {
    return this.pluginService.updateSettings(name, settings);
  }
}
