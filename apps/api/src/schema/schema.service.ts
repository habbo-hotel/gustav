import {IsNull, Not} from 'typeorm';
import {
  BadRequestException,
  ConflictException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DynamicComponentBindings,
  DynamicRecordInput,
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaDeleteCheckWire,
  DynamicSchemaField,
  DynamicSchemaInput,
  DynamicSchemaQueryWire,
  DynamicSchemaWire,
  GUSTAV_PLUGIN_SCHEMA_REGISTRY,
  PluginDynamicSchemaDefinition,
  PluginSchemaProvider,
  PluginSchemaRegistry,
} from '@gustav/types';

import {PageComponent} from '../database/entities/page-component.entity';
import {DynamicRecord} from '../database/entities/dynamic-record.entity';
import {DynamicSchema} from '../database/entities/dynamic-schema.entity';
import {DynamicRecordRepository} from '../database/repositories/dynamic-record.repository';
import {DynamicSchemaRepository} from '../database/repositories/dynamic-schema.repository';
import {PageComponentRepository} from '../database/repositories/page-component.repository';

@Injectable()
export class SchemaService {
  constructor(
    private readonly schemaRepository: DynamicSchemaRepository,
    private readonly recordRepository: DynamicRecordRepository,
    private readonly componentRepository: PageComponentRepository,
    @Inject(GUSTAV_PLUGIN_SCHEMA_REGISTRY)
    private readonly pluginSchemaRegistry: PluginSchemaRegistry
  ) {}

  async findAll(): Promise<DynamicSchemaWire[]> {
    const schemas = await this.schemaRepository.find({
      order: {name: 'ASC'},
    });

    const internalSchemas = await Promise.all(
      schemas.map(async schema => {
        const recordCount = await this.recordRepository.count({
          where: {schemaId: schema.id},
        });
        return this.mapSchemaToWire(schema, recordCount);
      })
    );
    const pluginSchemas = await this.findAllPluginSchemas();

    return [...internalSchemas, ...pluginSchemas].sort((a, b) =>
      a.name.localeCompare(b.name)
    );
  }

  async findOne(slug: string): Promise<DynamicSchemaWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      return this.mapPluginSchemaToWire(
        pluginSchema.schema,
        pluginSchema.provider
      );
    }

    const schema = await this.findSchemaBySlug(slug);
    const recordCount = await this.recordRepository.count({
      where: {schemaId: schema.id},
    });
    return this.mapSchemaToWire(schema, recordCount);
  }

  async create(input: DynamicSchemaInput): Promise<DynamicSchemaWire> {
    const normalized = this.normalizeSchemaInput(input);
    const pluginSchema = await this.findPluginSchemaBySlug(normalized.slug);
    if (pluginSchema) {
      throw new ConflictException(
        `Schema "${normalized.slug}" is provided by ${pluginSchema.provider.pluginName}`
      );
    }
    const existing = await this.schemaRepository.findOne({
      where: {slug: normalized.slug},
    });

    if (existing) {
      throw new ConflictException(`Schema "${normalized.slug}" already exists`);
    }

    const schema = await this.schemaRepository.createOne({
      name: normalized.name,
      slug: normalized.slug,
      description: normalized.description,
      fields: JSON.stringify(normalized.fields),
    });

    return this.mapSchemaToWire(schema, 0);
  }

  async update(
    slug: string,
    input: DynamicSchemaInput
  ): Promise<DynamicSchemaWire> {
    await this.assertNotPluginSchema(slug, 'update');
    const schema = await this.findSchemaBySlug(slug);
    const normalized = this.normalizeSchemaInput(input);

    if (normalized.slug !== slug) {
      const existing = await this.schemaRepository.findOne({
        where: {slug: normalized.slug},
      });
      if (existing && existing.id !== schema.id) {
        throw new ConflictException(
          `Schema "${normalized.slug}" already exists`
        );
      }
    }

    schema.name = normalized.name;
    schema.slug = normalized.slug;
    schema.description = normalized.description;
    schema.fields = JSON.stringify(normalized.fields);

    const saved = await this.schemaRepository.save(schema);
    if (slug !== saved.slug) {
      await this.updateComponentBindingSchemaSlug(slug, saved.slug);
    }
    const recordCount = await this.recordRepository.count({
      where: {schemaId: saved.id},
    });
    return this.mapSchemaToWire(saved, recordCount);
  }

  async checkDelete(slug: string): Promise<DynamicSchemaDeleteCheckWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      return {
        schemaId: this.getPluginSchemaId(pluginSchema.schema),
        dependencies: [
          {
            type: 'template-hook',
            label: `${pluginSchema.provider.pluginName} plugin schema`,
            count: 1,
          },
        ],
        dependencyCount: 1,
        canDelete: false,
      };
    }

    const schema = await this.findSchemaBySlug(slug);
    const recordCount = await this.recordRepository.count({
      where: {schemaId: schema.id},
    });
    const componentCount = await this.countComponentBindingDependencies(slug);

    const dependencies = [
      ...(recordCount > 0
        ? [
            {
              type: 'record' as const,
              label: 'Schema records',
              count: recordCount,
            },
          ]
        : []),
      ...(componentCount > 0
        ? [
            {
              type: 'page-component' as const,
              label: 'Page component bindings',
              count: componentCount,
            },
          ]
        : []),
    ];

    return {
      schemaId: schema.id,
      dependencies,
      dependencyCount: dependencies.reduce(
        (total, dep) => total + dep.count,
        0
      ),
      canDelete: dependencies.length === 0,
    };
  }

  async delete(slug: string, deleteDependencies = false): Promise<void> {
    await this.assertNotPluginSchema(slug, 'delete');
    const schema = await this.findSchemaBySlug(slug);
    const deleteCheck = await this.checkDelete(slug);

    if (!deleteCheck.canDelete && !deleteDependencies) {
      throw new ConflictException({
        message: `Schema "${schema.name}" has dependencies`,
        ...deleteCheck,
      });
    }

    if (deleteDependencies) {
      await this.clearComponentBindingDependencies(slug);
    }
    await this.schemaRepository.deleteOne(schema.id);
  }

  async findQueries(): Promise<DynamicSchemaQueryWire[]> {
    const schemas = await this.schemaRepository.find({
      order: {name: 'ASC'},
    });
    const pluginSchemas = await this.findAllPluginSchemas();
    return [
      ...schemas.map(schema => this.mapSchemaToQueryWire(schema)),
      ...pluginSchemas.map(schema => this.mapSchemaWireToQueryWire(schema)),
    ];
  }

  async findRecords(slug: string): Promise<DynamicRecordWire[]> {
    const result = await this.queryRecords(slug, {});
    return result.records;
  }

  async findRecord(
    slug: string,
    id: number | string
  ): Promise<DynamicRecordWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      if (pluginSchema.provider.findRecord) {
        return pluginSchema.provider.findRecord(slug, id);
      }
      const result = await pluginSchema.provider.queryRecords(slug, {
        limit: 1,
        filters: {id},
      });
      const record = result.records[0];
      if (!record) {
        throw new NotFoundException(`Record ${id} not found`);
      }
      return record;
    }

    const schema = await this.findSchemaBySlug(slug);
    const record = await this.recordRepository.findOne({
      where: {id: this.parseInternalRecordId(id), schemaId: schema.id},
    });

    if (!record) {
      throw new NotFoundException(`Record ${id} not found`);
    }

    return this.mapRecordToWire(record);
  }

  async findRecordByField(
    slug: string,
    fieldName: string,
    value: string
  ): Promise<DynamicRecordWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema?.provider.findRecordByField) {
      return pluginSchema.provider.findRecordByField(slug, fieldName, value);
    }

    const result = await this.queryRecords(slug, {
      limit: 1,
      filters: {[fieldName]: value},
    });
    const record = result.records[0];

    if (!record) {
      throw new NotFoundException(`Record ${fieldName}=${value} not found`);
    }

    return record;
  }

  async queryRecords(
    slug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      return pluginSchema.provider.queryRecords(slug, query);
    }

    const schema = await this.findSchemaBySlug(slug);
    const records = await this.recordRepository.find({
      where: {schemaId: schema.id},
      order: {updatedAt: 'DESC'},
    });
    const parsed = records
      .map(record => ({
        record,
        data: this.parseRecordData(record.data),
      }))
      .filter(item => this.matchesFilters(item.data, query.filters));
    const sorted = this.sortRecords(parsed, query);
    const offset = Math.max(query.offset || 0, 0);
    const limit = Math.max(query.limit || sorted.length, 0);

    return {
      records: sorted
        .slice(offset, offset + limit)
        .map(item => this.mapRecordToWire(item.record)),
      total: sorted.length,
    };
  }

  async createRecord(
    slug: string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      if (!pluginSchema.provider.createRecord) {
        throw new BadRequestException(
          `Schema "${slug}" does not support record creation`
        );
      }
      return pluginSchema.provider.createRecord(slug, input);
    }

    const schema = await this.findSchemaBySlug(slug);
    const data = this.normalizeRecordData(schema, input.data);

    const record = await this.recordRepository.createOne({
      schemaId: schema.id,
      data: JSON.stringify(data),
    });

    return this.mapRecordToWire(record);
  }

  async updateRecord(
    slug: string,
    id: number | string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      if (!pluginSchema.provider.updateRecord) {
        throw new BadRequestException(
          `Schema "${slug}" does not support record updates`
        );
      }
      return pluginSchema.provider.updateRecord(slug, id, input);
    }

    const schema = await this.findSchemaBySlug(slug);
    const record = await this.recordRepository.findOne({
      where: {id: this.parseInternalRecordId(id), schemaId: schema.id},
    });

    if (!record) {
      throw new NotFoundException(`Record ${id} not found`);
    }

    record.data = JSON.stringify(this.normalizeRecordData(schema, input.data));
    const saved = await this.recordRepository.save(record);
    return this.mapRecordToWire(saved);
  }

  async deleteRecord(slug: string, id: number | string): Promise<void> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      if (!pluginSchema.provider.deleteRecord) {
        throw new BadRequestException(
          `Schema "${slug}" does not support record deletion`
        );
      }
      return pluginSchema.provider.deleteRecord(slug, id);
    }

    const schema = await this.findSchemaBySlug(slug);
    const record = await this.recordRepository.findOne({
      where: {id: this.parseInternalRecordId(id), schemaId: schema.id},
    });

    if (!record) {
      throw new NotFoundException(`Record ${id} not found`);
    }

    await this.recordRepository.deleteOne(this.parseInternalRecordId(id));
  }

  private async findAllPluginSchemas(): Promise<DynamicSchemaWire[]> {
    const providers = this.pluginSchemaRegistry.getProviders();
    const schemas = await Promise.all(
      providers.map(async provider => {
        const definitions = await provider.findSchemas();
        return definitions.map(schema =>
          this.mapPluginSchemaToWire(schema, provider)
        );
      })
    );

    return schemas.flat();
  }

  private async findPluginSchemaBySlug(slug: string): Promise<{
    provider: PluginSchemaProvider;
    schema: PluginDynamicSchemaDefinition;
  } | null> {
    for (const provider of this.pluginSchemaRegistry.getProviders()) {
      const schemas = await provider.findSchemas();
      const schema = schemas.find(candidate => candidate.slug === slug);
      if (schema) {
        return {provider, schema};
      }
    }
    return null;
  }

  private async assertNotPluginSchema(
    slug: string,
    action: string
  ): Promise<void> {
    const pluginSchema = await this.findPluginSchemaBySlug(slug);
    if (pluginSchema) {
      throw new BadRequestException(
        `Cannot ${action} schema "${slug}" because it is provided by ${pluginSchema.provider.pluginName}`
      );
    }
  }

  private async findSchemaBySlug(slug: string): Promise<DynamicSchema> {
    const schema = await this.schemaRepository.findOne({where: {slug}});
    if (!schema) {
      throw new NotFoundException(`Schema "${slug}" not found`);
    }
    return schema;
  }

  private normalizeSchemaInput(input: DynamicSchemaInput): DynamicSchemaInput {
    const name = input.name?.trim();
    const slug = this.normalizeSlug(input.slug || input.name);

    if (!name) {
      throw new BadRequestException('Schema name is required');
    }

    if (!slug) {
      throw new BadRequestException('Schema slug is required');
    }

    if (!input.fields?.length) {
      throw new BadRequestException('At least one field is required');
    }

    return {
      name,
      slug,
      description: input.description?.trim() || undefined,
      fields: this.normalizeFields(input.fields),
    };
  }

  private normalizeFields(fields: DynamicSchemaField[]): DynamicSchemaField[] {
    const usedNames = new Set<string>();

    return fields.map(field => {
      const name = this.normalizeFieldName(field.name || field.label);
      const label = field.label?.trim() || name;

      if (!name) {
        throw new BadRequestException('Every schema field needs a name');
      }

      if (usedNames.has(name)) {
        throw new BadRequestException(`Duplicate field name "${name}"`);
      }

      usedNames.add(name);

      return {
        name,
        label,
        type: field.type || 'text',
        required: field.required || false,
        options: field.options?.filter(option => option.label && option.value),
      };
    });
  }

  private normalizeRecordData(
    schema: DynamicSchema,
    data: Record<string, unknown>
  ): Record<string, unknown> {
    const fields = this.parseFields(schema.fields);
    const normalized: Record<string, unknown> = {};

    fields.forEach(field => {
      const value = data?.[field.name];

      if (
        field.required &&
        (value === undefined || value === null || value === '')
      ) {
        throw new BadRequestException(`${field.label} is required`);
      }

      if (field.type === 'number') {
        normalized[field.name] =
          value === undefined || value === '' ? '' : Number(value);
        return;
      }

      if (field.type === 'checkbox') {
        normalized[field.name] = Boolean(value);
        return;
      }

      normalized[field.name] = value ?? '';
    });

    return normalized;
  }

  private normalizeSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]+/g, '')
      .replace(/^-+|-+$/g, '');
  }

  private normalizeFieldName(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9_-]+/g, '')
      .replace(/^-+|-+$/g, '');
  }

  private mapSchemaToWire(
    schema: DynamicSchema,
    recordCount?: number
  ): DynamicSchemaWire {
    return {
      id: schema.id,
      name: schema.name,
      slug: schema.slug,
      description: schema.description,
      fields: this.parseFields(schema.fields),
      recordCount,
      source: 'internal',
      createdAt: schema.createdAt,
      updatedAt: schema.updatedAt,
    };
  }

  private mapPluginSchemaToWire(
    schema: PluginDynamicSchemaDefinition,
    provider: PluginSchemaProvider
  ): DynamicSchemaWire {
    const timestamp = new Date(0).toISOString();
    return {
      id: this.getPluginSchemaId(schema),
      name: schema.name,
      slug: schema.slug,
      description: schema.description,
      fields: schema.fields,
      recordCount: schema.recordCount,
      source: 'plugin',
      pluginName: schema.pluginName || provider.pluginName,
      readOnly: schema.readOnly,
      createdAt: schema.createdAt || timestamp,
      updatedAt: schema.updatedAt || timestamp,
    };
  }

  private mapSchemaToQueryWire(schema: DynamicSchema): DynamicSchemaQueryWire {
    return {
      name: `load${this.toPascalCase(schema.slug)}s`,
      singleName: `load${this.toPascalCase(schema.slug)}`,
      schemaSlug: schema.slug,
      schemaName: schema.name,
      fields: this.parseFields(schema.fields),
    };
  }

  private mapSchemaWireToQueryWire(
    schema: DynamicSchemaWire
  ): DynamicSchemaQueryWire {
    return {
      name: `load${this.toPascalCase(schema.slug)}s`,
      singleName: `load${this.toPascalCase(schema.slug)}`,
      schemaSlug: schema.slug,
      schemaName: schema.name,
      fields: schema.fields,
    };
  }

  private mapRecordToWire(record: DynamicRecord): DynamicRecordWire {
    return {
      id: record.id,
      schemaId: record.schemaId,
      data: this.parseRecordData(record.data),
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    };
  }

  private parseFields(value: string): DynamicSchemaField[] {
    try {
      return JSON.parse(value || '[]');
    } catch {
      return [];
    }
  }

  private parseRecordData(value: string): Record<string, unknown> {
    try {
      return JSON.parse(value || '{}') as Record<string, unknown>;
    } catch {
      return {};
    }
  }

  private parseInternalRecordId(id: number | string): number {
    const parsed = Number(id);
    if (!Number.isInteger(parsed) || parsed <= 0) {
      throw new BadRequestException(`Invalid internal record id "${id}"`);
    }
    return parsed;
  }

  private getPluginSchemaId(schema: PluginDynamicSchemaDefinition): string {
    return `plugin:${schema.pluginName}:${schema.slug}`;
  }

  private matchesFilters(
    data: Record<string, unknown>,
    filters?: Record<string, unknown>
  ): boolean {
    return Object.entries(filters || {}).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return (
        String(data[key] ?? '').toLowerCase() === String(value).toLowerCase()
      );
    });
  }

  private sortRecords<
    T extends {data: Record<string, unknown>; record: DynamicRecord},
  >(records: T[], query: DynamicRecordQueryInput): T[] {
    const sortField = query.sortField;
    const sortDirection = query.sortDirection || 'DESC';

    return [...records].sort((a, b) => {
      const left = sortField ? a.data[sortField] : a.record.updatedAt;
      const right = sortField ? b.data[sortField] : b.record.updatedAt;
      const result = String(left ?? '').localeCompare(String(right ?? ''));
      return sortDirection === 'ASC' ? result : -result;
    });
  }

  private async countComponentBindingDependencies(
    schemaSlug: string
  ): Promise<number> {
    const components = await this.findComponentsWithBindings(schemaSlug);
    return components.length;
  }

  private async clearComponentBindingDependencies(
    schemaSlug: string
  ): Promise<void> {
    const components = await this.findComponentsWithBindings(schemaSlug);
    await Promise.all(
      components.map(component => {
        component.bindings = null;
        return this.componentRepository.save(component);
      })
    );
  }

  private async updateComponentBindingSchemaSlug(
    oldSlug: string,
    newSlug: string
  ): Promise<void> {
    const components = await this.findComponentsWithBindings(oldSlug);
    await Promise.all(
      components.map(component => {
        const bindings = this.parseBindings(component.bindings);
        if (bindings?.query?.schemaSlug === oldSlug) {
          bindings.query.schemaSlug = newSlug;
          component.bindings = JSON.stringify(bindings);
        }
        return this.componentRepository.save(component);
      })
    );
  }

  private async findComponentsWithBindings(
    schemaSlug: string
  ): Promise<PageComponent[]> {
    const components = await this.componentRepository.find({
      where: {bindings: Not(IsNull())},
    });
    return components.filter(component => {
      const bindings = this.parseBindings(component.bindings);
      return bindings?.query?.schemaSlug === schemaSlug;
    });
  }

  private parseBindings(
    value?: string | null
  ): DynamicComponentBindings | null {
    try {
      return JSON.parse(value || 'null') as DynamicComponentBindings | null;
    } catch {
      return null;
    }
  }

  private toPascalCase(value: string): string {
    return value
      .split(/[-_\s]+/)
      .filter(Boolean)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  }
}
