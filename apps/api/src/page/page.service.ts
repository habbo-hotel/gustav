import {Injectable, NotFoundException} from '@nestjs/common';
import {Page} from '../database/entities/page.entity';
import {PageRepository} from '../database/repositories/page.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';
import {PageComponent} from '../database/entities/page-component.entity';

@Injectable()
export class PageService {
  constructor(
    private readonly pageRepository: PageRepository,
    private readonly pageComponentRepository: PageComponentRepository
  ) {}

  async findAll(): Promise<Page[]> {
    return this.pageRepository.findAll();
  }

  async findOne(id: number): Promise<Page> {
    const page = await this.pageRepository.findWithComponents(id);
    if (!page) {
      throw new NotFoundException(`Page with ID ${id} not found`);
    }
    return page;
  }

  async findByPath(path: string): Promise<Page> {
    const page = await this.pageRepository.findByPath(path);
    if (!page) {
      throw new NotFoundException(`Page with path ${path} not found`);
    }
    return page;
  }

  async create(data: Partial<Page>): Promise<Page> {
    const page = this.pageRepository.create(data);
    await this.updatePath(page);
    return this.pageRepository.save(page);
  }

  async update(id: number, data: Partial<Page>): Promise<Page> {
    const page = await this.findOne(id);
    Object.assign(page, data);
    await this.updatePath(page);
    const updated = await this.pageRepository.save(page);
    
    // If parent or slug changed, update children paths recursively
    if (data.parentId !== undefined || data.slug !== undefined) {
      await this.updateChildrenPaths(updated);
    }
    
    return updated;
  }

  async delete(id: number): Promise<void> {
    await this.pageRepository.deleteOne(id);
  }

  async addComponent(pageId: number, data: Partial<PageComponent>): Promise<PageComponent> {
    const page = await this.findOne(pageId);
    const component = this.pageComponentRepository.create({
      ...data,
      pageId: page.id,
    });
    return this.pageComponentRepository.save(component);
  }

  async updateComponent(id: number, data: Partial<PageComponent>): Promise<PageComponent> {
    const component = await this.pageComponentRepository.findById(id);
    if (!component) {
      throw new NotFoundException(`Component with ID ${id} not found`);
    }
    Object.assign(component, data);
    return this.pageComponentRepository.save(component);
  }

  async removeComponent(id: number): Promise<void> {
    await this.pageComponentRepository.deleteOne(id);
  }

  async reorderComponents(pageId: number, componentIds: number[]): Promise<void> {
    await Promise.all(
      componentIds.map((id, index) =>
        this.pageComponentRepository.update(id, {displayOrder: index})
      )
    );
  }

  private async updatePath(page: Page): Promise<void> {
    if (!page.parentId) {
      page.path = `/${page.slug}`;
    } else {
      const parent = await this.pageRepository.findById(page.parentId);
      if (parent) {
        page.path = `${parent.path}/${page.slug}`.replace(/\/+/g, '/');
      } else {
        page.path = `/${page.slug}`;
      }
    }
  }

  private async updateChildrenPaths(page: Page): Promise<void> {
    const children = await this.pageRepository.find({where: {parentId: page.id}});
    for (const child of children) {
      await this.updatePath(child);
      const updatedChild = await this.pageRepository.save(child);
      await this.updateChildrenPaths(updatedChild);
    }
  }
}
