import {ActiveThemeWire, ThemePageDefinition} from '@gustav/types';

import {BaseSDK} from './base.sdk';

export class ThemeSDK extends BaseSDK {
  async getActiveTheme(): Promise<ActiveThemeWire> {
    return this.get<ActiveThemeWire>('/themes/active');
  }

  async setActiveTheme(pluginName: string | null): Promise<void> {
    await this.put('/themes/active', {activeTheme: pluginName});
  }

  async getThemePages(
    pluginName: string
  ): Promise<{pages: ThemePageDefinition[]}> {
    return this.get<{pages: ThemePageDefinition[]}>(
      `/themes/pages/${encodeURIComponent(pluginName)}`
    );
  }

  async importThemePages(
    pluginName: string,
    pages: ThemePageDefinition[],
    selectedPaths: string[]
  ): Promise<{created: string[]; skipped: string[]}> {
    return this.post<{created: string[]; skipped: string[]}>(
      `/themes/pages/${encodeURIComponent(pluginName)}/import`,
      {pages, selectedPaths}
    );
  }
}