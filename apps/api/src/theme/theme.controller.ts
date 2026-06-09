import {
  Controller,
  Get,
  Put,
  Post,
  Body,
  Param,
} from '@nestjs/common';

import {ThemeService} from './theme.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';
import {ActiveThemeWire, ThemePageDefinition} from '@gustav/types';

@Controller('themes')
export class ThemeController {
  constructor(private readonly themeService: ThemeService) {}

  @Get('active')
  async getActiveTheme(): Promise<ActiveThemeWire> {
    const activeTheme = await this.themeService.getActiveTheme();
    return {activeTheme};
  }

  @Put('active')
  @IsSuperAdmin()
  async setActiveTheme(
    @Body() body: {activeTheme: string | null}
  ): Promise<ActiveThemeWire> {
    await this.themeService.setActiveTheme(body.activeTheme);
    return {activeTheme: body.activeTheme};
  }

  @Get('pages/:pluginName')
  @IsSuperAdmin()
  async getThemeDefaultPages(
    @Param('pluginName') pluginName: string
  ): Promise<{pages: ThemePageDefinition[]}> {
    return {pages: []};
  }

  @Post('pages/:pluginName/import')
  @IsSuperAdmin()
  async importThemePages(
    @Param('pluginName') pluginName: string,
    @Body() body: {pages: ThemePageDefinition[]; selectedPaths: string[]}
  ): Promise<{created: string[]; skipped: string[]}> {
    return this.themeService.importThemePages(
      body.pages,
      body.selectedPaths
    );
  }
}