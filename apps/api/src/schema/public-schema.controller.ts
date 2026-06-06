import {Body, Controller, Get, Param, Post} from '@nestjs/common';
import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaQueryWire,
} from '@gustav/types';

import {SchemaService} from './schema.service';

@Controller('public/schemas')
export class PublicSchemaController {
  constructor(private readonly schemaService: SchemaService) {}

  @Get('queries')
  async findQueries(): Promise<DynamicSchemaQueryWire[]> {
    return this.schemaService.findQueries();
  }

  @Get(':slug/records')
  async findRecords(@Param('slug') slug: string): Promise<DynamicRecordWire[]> {
    return this.schemaService.findRecords(slug);
  }

  @Get(':slug/records/:id')
  async findRecord(
    @Param('slug') slug: string,
    @Param('id') id: string
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
}
