import {PageWire, PageComponentWire} from '@gustav/types';

import {BaseSDK} from './base.sdk';

export class PageSDK extends BaseSDK {
  async findAll(): Promise<PageWire[]> {
    return this.get<PageWire[]>('/pages');
  }

  async findOne(id: number): Promise<PageWire> {
    return this.get<PageWire>(`/pages/${id}`);
  }

  async findByPath(path: string): Promise<PageWire> {
    return this.get<PageWire>(
      `/pages/by-path?path=${encodeURIComponent(path)}`
    );
  }

  async getUsedPlugins(): Promise<{name: string; usageCount: number}[]> {
    return this.get<{name: string; usageCount: number}[]>(
      '/pages/used-plugins'
    );
  }

  async getPluginSettings(pluginName: string): Promise<Record<string, any>> {
    return this.get<Record<string, any>>(
      `/plugins/${encodeURIComponent(pluginName)}/settings`
    );
  }

  async updatePluginSettings(
    pluginName: string,
    settings: Record<string, any>
  ): Promise<void> {
    return this.post(
      `/plugins/${encodeURIComponent(pluginName)}/settings`,
      settings
    );
  }

  async create(data: Partial<PageWire>): Promise<PageWire> {
    return this.post<PageWire>('/pages', data);
  }

  async update(id: number, data: Partial<PageWire>): Promise<PageWire> {
    return this.put<PageWire>(`/pages/${id}`, data);
  }

  async removePage(id: number): Promise<void> {
    return this.delete<void>(`/pages/${id}`);
  }

  async findVersions(id: number): Promise<PageWire[]> {
    return this.get<PageWire[]>(`/pages/${id}/versions`);
  }

  async revert(id: number, versionId: number): Promise<PageWire> {
    return this.post<PageWire>(`/pages/${id}/revert/${versionId}`, {});
  }

  async addComponent(
    pageId: number,
    data: Partial<PageComponentWire>
  ): Promise<PageComponentWire> {
    return this.post<PageComponentWire>(`/pages/${pageId}/components`, data);
  }

  async updateComponent(
    id: number,
    data: Partial<PageComponentWire>
  ): Promise<PageComponentWire> {
    return this.put<PageComponentWire>(`/pages/components/${id}`, data);
  }

  async removeComponent(id: number): Promise<void> {
    return this.delete<void>(`/pages/components/${id}`);
  }

  async reorderComponents(
    pageId: number,
    componentIds: number[]
  ): Promise<void> {
    return this.post(`/pages/${pageId}/reorder-components`, {componentIds});
  }

  async saveDataViewModel(
    pageId: number,
    dataViewModel: string
  ): Promise<void> {
    return this.put(`/pages/${pageId}/data-view`, {dataViewModel});
  }
}
