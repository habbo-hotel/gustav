import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseBoolPipe,
  ParseIntPipe,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import {
  DynamicRecordInput,
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaDeleteCheckWire,
  DynamicSchemaInput,
  DynamicSchemaQueryWire,
  DynamicSchemaWire,
} from '@gustav/types';

import {SchemaService} from './schema.service';
import {IsSuperAdmin} from '../auth/is-super-admin.decorator';

@Controller('schemas')
@IsSuperAdmin()
export class SchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get()
  async findAll(): Promise<DynamicSchemaWire[]> {
    return this.schemaService.findAll();
  }

  @Get('queries')
  async findQueries(): Promise<DynamicSchemaQueryWire[]> {
    return this.schemaService.findQueries();
  }

  @Get(':slug')
  async findOne(@Param('slug') slug: string): Promise<DynamicSchemaWire> {
    return this.schemaService.findOne(slug);
  }

  @Post()
  async create(@Body() input: DynamicSchemaInput): Promise<DynamicSchemaWire> {
    return this.schemaService.create(input);
  }

  @Put(':slug')
  async update(
    @Param('slug') slug: string,
    @Body() input: DynamicSchemaInput
  ): Promise<DynamicSchemaWire> {
    return this.schemaService.update(slug, input);
  }

  @Get(':slug/delete-check')
  async checkDelete(
    @Param('slug') slug: string
  ): Promise<DynamicSchemaDeleteCheckWire> {
    return this.schemaService.checkDelete(slug);
  }

  @Delete(':slug')
  async delete(
    @Param('slug') slug: string,
    @Query('deleteDependencies', new ParseBoolPipe({optional: true}))
    deleteDependencies = false
  ): Promise<void> {
    return this.schemaService.delete(slug, deleteDependencies);
  }

  @Get(':slug/records')
  async findRecords(@Param('slug') slug: string): Promise<DynamicRecordWire[]> {
    return this.schemaService.findRecords(slug);
  }

  @Get(':slug/records/:id')
  async findRecord(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number
  ): Promise<DynamicRecordWire> {
    return this.schemaService.findRecord(slug, id);
  }

  @Get(':slug/by/:field/:value')
  async findRecordByField(
    @Param('slug') slug: string,
    @Param('field') field: string,
    @Param('value') value: string
  ): Promise<DynamicRecordWire> {
    return this.schemaService.findRecordByField(slug, field, value);
  }

  @Post(':slug/query')
  async queryRecords(
    @Param('slug') slug: string,
    @Body() query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    return this.schemaService.queryRecords(slug, query);
  }

  @Post(':slug/records')
  async createRecord(
    @Param('slug') slug: string,
    @Body() input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    return this.schemaService.createRecord(slug, input);
  }

  @Put(':slug/records/:id')
  async updateRecord(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
    @Body() input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    return this.schemaService.updateRecord(slug, id, input);
  }

  @Delete(':slug/records/:id')
  async deleteRecord(
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number
  ): Promise<void> {
    return this.schemaService.deleteRecord(slug, id);
  }
}
