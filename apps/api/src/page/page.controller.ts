import {PageWire, PageComponentWire} from '@gustav/types';
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  ParseIntPipe,
  Query,
} from '@nestjs/common';

import {PageService} from './page.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';
import {PageComponent} from '../database/entities/page-component.entity';

@Controller('pages')
export class PageController {
  constructor(private readonly pageService: PageService) {}

  @Get()
  async findAll(): Promise<PageWire[]> {
    return this.pageService.findAll();
  }

  @Get('by-path')
  async findByPath(@Query('path') path: string): Promise<PageWire> {
    return this.pageService.findByPath(path);
  }

  @Get('used-plugins')
  @IsSuperAdmin()
  async findUsedPlugins() {
    return this.pageService.findUsedPlugins();
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<PageWire> {
    return this.pageService.findOne(id);
  }

  @Post()
  @IsSuperAdmin()
  async create(@Body() data: Partial<PageWire>): Promise<PageWire> {
    return this.pageService.create(data);
  }

  @Put(':id')
  @IsSuperAdmin()
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<PageWire>
  ): Promise<PageWire> {
    return this.pageService.update(id, data);
  }

  @Get(':id/versions')
  @IsSuperAdmin()
  async findVersions(
    @Param('id', ParseIntPipe) id: number
  ): Promise<PageWire[]> {
    return this.pageService.findVersions(id);
  }

  @Post(':id/revert/:versionId')
  @IsSuperAdmin()
  async revert(
    @Param('id', ParseIntPipe) id: number,
    @Param('versionId', ParseIntPipe) versionId: number
  ): Promise<PageWire> {
    return this.pageService.revert(id, versionId);
  }

  @Delete(':id')
  @IsSuperAdmin()
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.pageService.delete(id);
  }

  @Post(':id/components')
  @IsSuperAdmin()
  async addComponent(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<PageComponent>
  ): Promise<PageComponentWire> {
    return this.pageService.addComponent(id, data);
  }

  @Put('components/:id')
  @IsSuperAdmin()
  async updateComponent(
    @Param('id', ParseIntPipe) id: number,
    @Body() data: Partial<PageComponent>
  ): Promise<PageComponentWire> {
    return this.pageService.updateComponent(id, data);
  }

  @Delete('components/:id')
  @IsSuperAdmin()
  async removeComponent(@Param('id', ParseIntPipe) id: number) {
    return this.pageService.removeComponent(id);
  }

  @Post(':id/reorder-components')
  @IsSuperAdmin()
  async reorderComponents(
    @Param('id', ParseIntPipe) id: number,
    @Body('componentIds') componentIds: number[]
  ) {
    return this.pageService.reorderComponents(id, componentIds);
  }

  @Put(':id/data-view')
  @IsSuperAdmin()
  async saveDataViewModel(
    @Param('id', ParseIntPipe) id: number,
    @Body('dataViewModel') dataViewModel: string
  ): Promise<void> {
    return this.pageService.saveDataViewModel(id, dataViewModel);
  }
}
