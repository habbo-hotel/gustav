import {Injectable, NotFoundException} from '@nestjs/common';
import {PageComponentWire, PageStatus, PageWire} from '@gustav/types';

import {Page} from '../database/entities/page.entity';
import {PageVersion} from '../database/entities/page-version.entity';
import {PageRepository} from '../database/repositories/page.repository';
import {PageComponent} from '../database/entities/page-component.entity';
import {PageVersionRepository} from '../database/repositories/page-version.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly versionRepository: PageVersionRepository,
    private readonly componentRepository: PageComponentRepository
  ) {}

  async findAll(): Promise<PageWire[]> {
    const identities = await this.pageRepository.find({
      relations: ['versions'],
    });

    return identities.map(identity => {
      // For listing/navigation, prioritize the PUBLISHED version
      // This ensures the public site sees live content and the admin list shows the current live state
      const current =
        identity.versions.find(v => v.status === PageStatus.PUBLISHED) ||
        identity.versions.find(v => v.status === PageStatus.DRAFT) ||
        identity.versions[0];

      return this.mapToWire(identity, current);
    });
  }

  async findOne(id: number): Promise<PageWire> {
    const identity = await this.pageRepository.findOne({
      where: {id},
      relations: ['versions'],
    });

    if (!identity) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }

    // For the editor/detailed view, prioritize the DRAFT version
    const latest =
      identity.versions.find(v => v.status === PageStatus.DRAFT) ||
      identity.versions.find(v => v.status === PageStatus.PUBLISHED) ||
      identity.versions[0];

    // Load components for the chosen version
    const versionWithComponents = await this.versionRepository.findOne({
      where: {id: latest.id},
      relations: ['components'],
      order: {components: {displayOrder: 'ASC'}},
    });

    return this.mapToWire(identity, versionWithComponents!);
  }

  async findByPath(path: string): Promise<PageWire> {
    const version = await this.versionRepository.findOne({
      where: {path, status: PageStatus.PUBLISHED},
      relations: ['components'],
      order: {components: {displayOrder: 'ASC'}},
    });

    if (!version) {
      throw new NotFoundException(`Published page with path ${path} not found`);
    }

    const identity = await this.pageRepository.findById(version.pageId);
    return this.mapToWire(identity!, version);
  }

  async create(data: Partial<PageWire>): Promise<PageWire> {
    const identity = await this.pageRepository.createOne({});
    const version = this.versionRepository.create({
      pageId: identity.id,
      versionNumber: 1,
      title: data.title || 'Untitled Page',
      slug: data.slug || 'untitled',
      status: data.status || PageStatus.DRAFT,
      showInNavigation: data.showInNavigation ?? true,
      parentId: data.parentId,
    });

    await this.updatePath(version);
    const savedVersion = await this.versionRepository.save(version);
    return this.mapToWire(identity, savedVersion);
  }

  async update(id: number, data: Partial<PageWire>): Promise<PageWire> {
    const identity = await this.pageRepository.findOne({
      where: {id},
      relations: ['versions'],
    });
    if (!identity) throw new NotFoundException(`Page ${id} not found`);

    let draft = identity.versions.find(v => v.status === PageStatus.DRAFT);
    const isPublishing = data.status === PageStatus.PUBLISHED;

    // If no draft exists and we are making an edit, create a draft
    const hasMetadataChanges =
      data.title !== undefined ||
      data.slug !== undefined ||
      data.parentId !== undefined ||
      data.showInNavigation !== undefined;

    if (!draft && hasMetadataChanges) {
      const published = identity.versions.find(
        v => v.status === PageStatus.PUBLISHED
      );
      if (published) {
        draft = await this.createDraftFromPublished(identity.id, published);
      } else {
        draft = identity.versions[0];
      }
    }

    // If no draft exists and no changes, return the latest
    if (!draft) {
      const latest =
        identity.versions.find(v => v.status === PageStatus.PUBLISHED) ||
        identity.versions[0];

      if (isPublishing && latest.status === PageStatus.PUBLISHED) {
        return this.mapToWire(identity, latest);
      }

      draft = latest;
    }

    // Apply updates to the draft
    if (data.title !== undefined) draft.title = data.title;
    if (data.slug !== undefined) draft.slug = data.slug;
    if (data.parentId !== undefined) draft.parentId = data.parentId;
    if (data.showInNavigation !== undefined)
      draft.showInNavigation = data.showInNavigation;

    await this.updatePath(draft);

    if (isPublishing) {
      // Archive current published version
      const currentPub = identity.versions.find(
        v => v.status === PageStatus.PUBLISHED
      );
      if (currentPub && currentPub.id !== draft.id) {
        currentPub.status = PageStatus.ARCHIVED;
        await this.versionRepository.save(currentPub);
      }
      draft.status = PageStatus.PUBLISHED;
    }

    const savedVersion = await this.versionRepository.save(draft);

    // If path might have changed, update all children's versions
    if (
      data.slug !== undefined ||
      data.parentId !== undefined ||
      isPublishing
    ) {
      await this.updateChildrenPaths(identity.id);
    }

    return this.mapToWire(identity, savedVersion);
  }

  async findVersions(pageId: number): Promise<PageWire[]> {
    const identity = await this.pageRepository.findOne({
      where: {id: pageId},
      relations: ['versions'],
    });

    if (!identity) throw new NotFoundException(`Page ${pageId} not found`);

    return identity.versions
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .map(v => this.mapToWire(identity, v));
  }

  async revert(pageId: number, versionId: number): Promise<PageWire> {
    const identity = await this.pageRepository.findOne({
      where: {id: pageId},
      relations: ['versions'],
    });
    if (!identity) throw new NotFoundException(`Page ${pageId} not found`);

    const targetVersion = await this.versionRepository.findOne({
      where: {id: versionId, pageId},
      relations: ['components'],
    });
    if (!targetVersion)
      throw new NotFoundException(`Version ${versionId} not found`);

    // Archive current draft if it exists
    const currentDraft = identity.versions.find(
      v => v.status === PageStatus.DRAFT
    );
    if (currentDraft) {
      currentDraft.status = PageStatus.ARCHIVED;
      await this.versionRepository.save(currentDraft);
    }

    // Create a new draft as a clone of the target version
    const maxVersion = Math.max(...identity.versions.map(v => v.versionNumber));
    const newDraft = this.versionRepository.create({
      pageId: identity.id,
      versionNumber: maxVersion + 1,
      title: targetVersion.title,
      slug: targetVersion.slug,
      path: targetVersion.path,
      status: PageStatus.DRAFT,
      showInNavigation: targetVersion.showInNavigation,
      parentId: targetVersion.parentId,
    });
    const savedDraft = await this.versionRepository.save(newDraft);

    // Clone components
    const clonedComponents = targetVersion.components!.map(c =>
      this.componentRepository.create({
        pluginName: c.pluginName,
        componentName: c.componentName,
        props: c.props,
        displayOrder: c.displayOrder,
        pageVersionId: savedDraft.id,
      })
    );
    await this.componentRepository.save(clonedComponents);

    return this.mapToWire(identity, savedDraft);
  }

  async delete(id: number): Promise<void> {
    await this.pageRepository.deleteOne(id);
  }

  async addComponent(
    pageId: number,
    data: Partial<PageComponent>
  ): Promise<PageComponentWire> {
    const identity = await this.pageRepository.findOne({
      where: {id: pageId},
      relations: ['versions'],
    });
    if (!identity) throw new NotFoundException(`Page ${pageId} not found`);

    let draft = identity.versions.find(v => v.status === PageStatus.DRAFT);
    if (!draft) {
      const published = identity.versions.find(
        v => v.status === PageStatus.PUBLISHED
      );
      if (published) {
        draft = await this.createDraftFromPublished(identity.id, published);
      } else {
        // Fallback for draft-only pages
        draft = identity.versions[0];
      }
    }

    const component = this.componentRepository.create({
      ...data,
      pageVersionId: draft.id,
    });
    const saved = await this.componentRepository.save(component);
    return this.mapComponentToWire(saved, pageId);
  }

  async updateComponent(
    id: number,
    data: Partial<PageComponent>
  ): Promise<PageComponentWire> {
    const component = await this.componentRepository.findOne({
      where: {id},
      relations: [
        'pageVersion',
        'pageVersion.page',
        'pageVersion.page.versions',
      ],
    });
    if (!component || !component.pageVersion) {
      throw new NotFoundException(`Component with ID ${id} not found`);
    }

    const pageId = component.pageVersion.pageId;
    const identity = component.pageVersion.page;

    // 1. If it already belongs to a draft, just update it directly
    if (component.pageVersion.status === PageStatus.DRAFT) {
      Object.assign(component, data);
      const saved = await this.componentRepository.save(component);
      return this.mapComponentToWire(saved, pageId);
    }

    // 2. It belongs to a published version, find or create a draft
    let draft = identity.versions.find(v => v.status === PageStatus.DRAFT);
    if (!draft) {
      draft = await this.createDraftFromPublished(
        pageId,
        component.pageVersion
      );
    }

    // 3. Find the equivalent component in the draft
    // We match by pluginName, componentName, displayOrder, and parentId
    // Since we clone with preserving parentId relationships (cloned parent ID matches cloned child),
    // we need to be careful.
    // Actually, when we clone in createDraftFromPublished, we should probably return the ID mapping.
    // But for now, we'll use a slightly better search.
    const draftComponent = await this.componentRepository.findOne({
      where: {
        pageVersionId: draft.id,
        pluginName: component.pluginName,
        componentName: component.componentName,
        displayOrder: component.displayOrder,
      },
    });

    if (!draftComponent) {
      throw new NotFoundException('Component not found in draft');
    }

    Object.assign(draftComponent, data);
    const saved = await this.componentRepository.save(draftComponent);
    return this.mapComponentToWire(saved, pageId);
  }

  async removeComponent(id: number): Promise<void> {
    const component = await this.componentRepository.findOne({
      where: {id},
      relations: [
        'pageVersion',
        'pageVersion.page',
        'pageVersion.page.versions',
      ],
    });
    if (!component || !component.pageVersion) return;

    // 1. If it already belongs to a draft, just delete it directly
    if (component.pageVersion.status === PageStatus.DRAFT) {
      await this.componentRepository.deleteOne(id);
      return;
    }

    // 2. It's published, find or create a draft
    const identity = component.pageVersion.page;
    let draft = identity.versions.find(v => v.status === PageStatus.DRAFT);

    if (!draft) {
      draft = await this.createDraftFromPublished(
        identity.id,
        component.pageVersion
      );
    }

    // 3. Find and remove equivalent component in draft
    // Since clones in the draft might have different parentIds, we match by
    // the core attributes. We also include parentId mapping logic if possible.
    // For now, we'll find components in the draft that match the plugin, name, and display order.
    const draftComponents = await this.componentRepository.find({
      where: {
        pageVersionId: draft.id,
        pluginName: component.pluginName,
        componentName: component.componentName,
        displayOrder: component.displayOrder,
      },
    });

    // If there are multiple (due to nesting), we try to pick the one that matches the original's position.
    // In most cases, there's only one match at a specific displayOrder per parent level.
    // We'll just delete the first match for now, as re-fetching the page will sync the frontend.
    if (draftComponents.length > 0) {
      await this.componentRepository.deleteOne(draftComponents[0].id);
    }
  }

  async reorderComponents(
    pageId: number,
    componentIds: number[]
  ): Promise<void> {
    const identity = await this.pageRepository.findOne({
      where: {id: pageId},
      relations: ['versions'],
    });
    if (!identity) return;

    let draft = identity.versions.find(v => v.status === PageStatus.DRAFT);
    let idMapping: Record<number, number> | null = null;

    if (!draft) {
      const published = identity.versions.find(
        v => v.status === PageStatus.PUBLISHED
      );
      if (published) {
        // We need to create a draft AND track which old IDs map to new IDs
        // Actually, createDraftFromPublished doesn't return mapping yet.
        // Let's find the equivalent components manually.
        draft = await this.createDraftFromPublished(identity.id, published);

        const draftComponents = await this.componentRepository.find({
          where: {pageVersionId: draft.id},
        });

        const publishedComponents = await this.componentRepository.find({
          where: {pageVersionId: published.id},
        });

        idMapping = {};
        publishedComponents.forEach(pc => {
          const match = draftComponents.find(
            dc =>
              dc.pluginName === pc.pluginName &&
              dc.componentName === pc.componentName &&
              dc.displayOrder === pc.displayOrder
          );
          if (match) idMapping![pc.id] = match.id;
        });
      }
    }

    if (!draft) return;

    // Use mapping if we just created a draft, otherwise use IDs directly
    await Promise.all(
      componentIds.map((id, index) => {
        const targetId = idMapping ? idMapping[id] : id;
        if (!targetId) return Promise.resolve();
        return this.componentRepository.update(targetId, {displayOrder: index});
      })
    );
  }

  async findUsedPlugins(): Promise<{name: string; usageCount: number}[]> {
    const result = await this.componentRepository
      .createQueryBuilder('comp')
      .select('comp.pluginName', 'name')
      .addSelect('COUNT(*)', 'usageCount')
      .groupBy('comp.pluginName')
      .getRawMany();

    return result.map(r => ({
      name: r.name,
      usageCount: parseInt(r.usageCount),
    }));
  }

  private mapToWire(identity: Page, version: PageVersion): PageWire {
    return {
      id: identity.id,
      versionId: version.id,
      versionNumber: version.versionNumber,
      title: version.title,
      slug: version.slug,
      path: version.path,
      status: version.status,
      showInNavigation: version.showInNavigation,
      parentId: version.parentId,
      components: version.components?.map(c =>
        this.mapComponentToWire(c, identity.id)
      ),
      hasDraft: identity.versions?.some(v => v.status === PageStatus.DRAFT),
      createdAt: identity.createdAt,
      updatedAt: version.updatedAt,
    };
  }

  private mapComponentToWire(
    component: PageComponent,
    pageId: number
  ): PageComponentWire {
    return {
      id: component.id,
      pageId: pageId,
      parentId: component.parentId,
      pluginName: component.pluginName,
      componentName: component.componentName,
      props: component.props,
      displayOrder: component.displayOrder,
    };
  }

  private async createDraftFromPublished(
    pageId: number,
    published: PageVersion
  ): Promise<PageVersion> {
    // 1. Create new draft version
    const draft = this.versionRepository.create({
      pageId,
      versionNumber: (published.versionNumber || 0) + 1,
      title: published.title,
      slug: published.slug,
      path: published.path,
      status: PageStatus.DRAFT,
      showInNavigation: published.showInNavigation,
      parentId: published.parentId,
    });
    const savedDraft = await this.versionRepository.save(draft);

    // 2. Clone components preserving parent-child relationships
    const components = await this.componentRepository.find({
      where: {pageVersionId: published.id},
    });

    const idMap = new Map<number, PageComponent>();

    const clonedComponents = components.map(c => {
      const cloned = this.componentRepository.create({
        pluginName: c.pluginName,
        componentName: c.componentName,
        props: c.props,
        displayOrder: c.displayOrder,
        pageVersionId: savedDraft.id,
      });
      idMap.set(c.id, cloned);
      return cloned;
    });

    // Set parentId for clones
    components.forEach(c => {
      if (c.parentId) {
        const cloned = idMap.get(c.id);
        const clonedParent = idMap.get(c.parentId);
        if (cloned && clonedParent) {
          cloned.parent = clonedParent;
        }
      }
    });

    await this.componentRepository.save(clonedComponents);

    return savedDraft;
  }

  private async updatePath(version: PageVersion): Promise<void> {
    if (!version.parentId) {
      version.path = `/${version.slug}`;
    } else {
      // Find parent's current path (DRAFT if exists, else PUBLISHED)
      const parentVersions = await this.versionRepository.find({
        where: {pageId: version.parentId},
      });
      const parentVersion =
        parentVersions.find(v => v.status === PageStatus.DRAFT) ||
        parentVersions.find(v => v.status === PageStatus.PUBLISHED) ||
        parentVersions[0];

      if (parentVersion) {
        version.path = `${parentVersion.path}/${version.slug}`.replace(
          /\/+/g,
          '/'
        );
      } else {
        version.path = `/${version.slug}`;
      }
    }
  }

  private async updateChildrenPaths(pageId: number): Promise<void> {
    // Find all children versions (draft or published)
    const childrenVersions = await this.versionRepository.find({
      where: {parentId: pageId},
    });

    for (const childVersion of childrenVersions) {
      await this.updatePath(childVersion);
      await this.versionRepository.save(childVersion);
      // Recursively update grandchildren
      await this.updateChildrenPaths(childVersion.pageId);
    }
  }
}
