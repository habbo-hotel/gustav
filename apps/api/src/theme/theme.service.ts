import {Injectable} from '@nestjs/common';

import {ThemeSettingRepository} from '../database/repositories/theme-setting.repository';
import {PageRepository} from '../database/repositories/page.repository';
import {PageVersionRepository} from '../database/repositories/page-version.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';
import {ThemePageDefinition, ThemePageComponentDefinition, PageStatus} from '@gustav/types';
import {Page} from '../database/entities/page.entity';
import {PageVersion} from '../database/entities/page-version.entity';
import {PageComponent} from '../database/entities/page-component.entity';

@Injectable()
export class ThemeService {
  constructor(
    private readonly themeSettingRepository: ThemeSettingRepository,
    private readonly pageRepository: PageRepository,
    private readonly versionRepository: PageVersionRepository,
    private readonly componentRepository: PageComponentRepository
  ) {}

  async getActiveTheme(): Promise<string | null> {
    const setting = await this.themeSettingRepository.findActive();
    return setting?.activeTheme ?? null;
  }

  async setActiveTheme(pluginName: string | null): Promise<void> {
    let setting = await this.themeSettingRepository.findActive();
    if (setting) {
      setting.activeTheme = pluginName;
      await this.themeSettingRepository.save(setting);
    } else {
      await this.themeSettingRepository.createOne({
        activeTheme: pluginName,
      });
    }
  }

  async importThemePages(
    defaultPages: ThemePageDefinition[],
    selectedPaths: string[]
  ): Promise<{created: string[]; skipped: string[]}> {
    const selectedPages = defaultPages.filter(p =>
      selectedPaths.includes(p.path)
    );
    const created: string[] = [];
    const skipped: string[] = [];

    const pathToId = new Map<string, number>();

    for (const pageDef of selectedPages) {
      const existingByPath = await this.versionRepository.findOne({
        where: {path: pageDef.path, status: PageStatus.PUBLISHED},
      });

      if (existingByPath) {
        skipped.push(pageDef.path);
        continue;
      }

      const page = new Page();
      const savedPage = await this.pageRepository.save(page);

      const version = new PageVersion();
      version.pageId = savedPage.id;
      version.title = pageDef.title;
      version.slug = pageDef.slug;
      version.path = pageDef.path;
      version.status = PageStatus.DRAFT;
      version.showInNavigation = pageDef.showInNavigation;
      version.versionNumber = 1;

      if (pageDef.parentPath) {
        const parentPathId = pathToId.get(pageDef.parentPath);
        if (parentPathId) {
          version.parentId = parentPathId;
        }
      }

      const savedVersion = await this.versionRepository.save(version);

      const components = this.buildComponents(
        pageDef.components,
        savedVersion.id
      );
      await this.componentRepository.save(components);

      pathToId.set(pageDef.path, savedPage.id);
      created.push(pageDef.path);
    }

    return {created, skipped};
  }

  private buildComponents(
    componentDefs: ThemePageComponentDefinition[],
    versionId: number
  ): PageComponent[] {
    const idMap = new Map<number, number>();
    const components: PageComponent[] = [];

    const sorted = [...componentDefs].sort(
      (a, b) => a.displayOrder - b.displayOrder
    );

    for (const def of sorted) {
      const component = new PageComponent();
      component.pageVersionId = versionId;
      component.pluginName = def.pluginName;
      component.componentName = def.componentName;
      component.props = JSON.stringify(def.props);
      component.displayOrder = def.displayOrder;
      component.slot = def.slot ?? undefined;
      component.parentId = def.parentIndex != null
        ? idMap.get(def.parentIndex) ?? undefined
        : undefined;

      components.push(component);
    }

    return components;
  }
}