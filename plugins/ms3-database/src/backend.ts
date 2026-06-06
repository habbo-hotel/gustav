import {
  BadRequestException,
  Inject,
  Injectable,
  Module,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import {createPool, RowDataPacket} from 'mysql2/promise';
import {
  DynamicRecordInput,
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaField,
  GUSTAV_PLUGIN_SCHEMA_REGISTRY,
  PluginDynamicSchemaDefinition,
  PluginSchemaProvider,
  PluginSchemaRegistry,
} from '@gustav/types';

const PLUGIN_NAME = '@gustav/ms3-database-plugin';
const MS3_DATABASE = process.env.MS3_DB_NAME || 'ms3';
const CACHE_MS = 30_000;

interface TableColumn {
  tableName: string;
  columnName: string;
  ordinalPosition: number;
  columnDefault: string | null;
  isNullable: 'YES' | 'NO';
  dataType: string;
  columnType: string;
  columnKey: string;
  extra: string;
}

interface TableMetadata {
  tableName: string;
  slug: string;
  name: string;
  primaryKey?: string;
  columns: TableColumn[];
  fields: DynamicSchemaField[];
  recordCount: number;
}

interface MetadataCache {
  expiresAt: number;
  tables: TableMetadata[];
}

@Injectable()
class Ms3DatabaseSchemaProvider implements PluginSchemaProvider {
  pluginName = PLUGIN_NAME;

  private readonly pool: any;
  private metadataCache?: MetadataCache;

  constructor() {
    this.pool = createPool({
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || '3306'),
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || 'password',
      database: MS3_DATABASE,
      waitForConnections: true,
      connectionLimit: Number(process.env.MS3_DB_CONNECTION_LIMIT || '5'),
      charset: 'utf8mb4',
    });
  }

  async findSchemas(): Promise<PluginDynamicSchemaDefinition[]> {
    const tables = await this.getMetadata();
    const now = new Date().toISOString();

    return tables.map(table => ({
      pluginName: PLUGIN_NAME,
      name: table.name,
      slug: table.slug,
      description: `MS3 table: ${table.tableName}`,
      fields: table.fields,
      recordCount: table.recordCount,
      readOnly: !table.primaryKey,
      createdAt: now,
      updatedAt: now,
    }));
  }

  async queryRecords(
    schemaSlug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    const table = await this.findTable(schemaSlug);
    const rows = await this.selectRows(table);
    const filtered = rows.filter(row => this.matchesFilters(row, query.filters));
    const sorted = this.sortRows(filtered, query);
    const offset = Math.max(query.offset || 0, 0);
    const limit = Math.max(query.limit || sorted.length, 0);

    return {
      records: sorted
        .slice(offset, offset + limit)
        .map(row => this.mapRowToRecord(table, row)),
      total: sorted.length,
    };
  }

  async findRecord(
    schemaSlug: string,
    id: number | string
  ): Promise<DynamicRecordWire> {
    const table = await this.findTable(schemaSlug);
    const primaryKey = this.requirePrimaryKey(table);
    const [rows] = await this.pool.execute(
      `SELECT * FROM ${this.escapeIdentifier(table.tableName)} WHERE ${this.escapeIdentifier(primaryKey)} = ? LIMIT 1`,
      [id]
    );
    const row = (rows as RowDataPacket[])[0];

    if (!row) {
      throw new NotFoundException(`Record ${id} not found`);
    }

    return this.mapRowToRecord(table, row);
  }

  async findRecordByField(
    schemaSlug: string,
    fieldName: string,
    value: string
  ): Promise<DynamicRecordWire> {
    const table = await this.findTable(schemaSlug);
    this.requireColumn(table, fieldName);
    const [rows] = await this.pool.execute(
      `SELECT * FROM ${this.escapeIdentifier(table.tableName)} WHERE ${this.escapeIdentifier(fieldName)} = ? LIMIT 1`,
      [value]
    );
    const row = (rows as RowDataPacket[])[0];

    if (!row) {
      throw new NotFoundException(`Record ${fieldName}=${value} not found`);
    }

    return this.mapRowToRecord(table, row);
  }

  async createRecord(
    schemaSlug: string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    const table = await this.findTable(schemaSlug);
    const writableColumns = this.getWritableColumns(table, input.data);
    const values = writableColumns.map(column => input.data[column.columnName]);
    const sql =
      writableColumns.length > 0
        ? `INSERT INTO ${this.escapeIdentifier(table.tableName)} (${writableColumns
            .map(column => this.escapeIdentifier(column.columnName))
            .join(', ')}) VALUES (${writableColumns.map(() => '?').join(', ')})`
        : `INSERT INTO ${this.escapeIdentifier(table.tableName)} () VALUES ()`;
    const [result] = await this.pool.execute(sql, values);
    const primaryKey = this.requirePrimaryKey(table);
    const id = input.data[primaryKey] ?? result.insertId;

    return this.findRecord(schemaSlug, id);
  }

  async updateRecord(
    schemaSlug: string,
    id: number | string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    const table = await this.findTable(schemaSlug);
    const primaryKey = this.requirePrimaryKey(table);
    const writableColumns = this.getWritableColumns(table, input.data).filter(
      column => column.columnName !== primaryKey
    );

    if (writableColumns.length > 0) {
      await this.pool.execute(
        `UPDATE ${this.escapeIdentifier(table.tableName)} SET ${writableColumns
          .map(column => `${this.escapeIdentifier(column.columnName)} = ?`)
          .join(', ')} WHERE ${this.escapeIdentifier(primaryKey)} = ?`,
        [...writableColumns.map(column => input.data[column.columnName]), id]
      );
    }

    return this.findRecord(schemaSlug, id);
  }

  async deleteRecord(schemaSlug: string, id: number | string): Promise<void> {
    const table = await this.findTable(schemaSlug);
    const primaryKey = this.requirePrimaryKey(table);
    await this.pool.execute(
      `DELETE FROM ${this.escapeIdentifier(table.tableName)} WHERE ${this.escapeIdentifier(primaryKey)} = ?`,
      [id]
    );
  }

  private async getMetadata(): Promise<TableMetadata[]> {
    const now = Date.now();
    if (this.metadataCache && this.metadataCache.expiresAt > now) {
      return this.metadataCache.tables;
    }

    const [tableRows] = await this.pool.execute(
      `SELECT TABLE_NAME AS tableName
       FROM information_schema.TABLES
       WHERE TABLE_SCHEMA = ? AND TABLE_TYPE = 'BASE TABLE'
       ORDER BY TABLE_NAME`,
      [MS3_DATABASE]
    );
    const tableNames = (tableRows as RowDataPacket[]).map((row: RowDataPacket) =>
      String(row.tableName)
    );
    const columns = await this.getColumns(tableNames);
    const slugCounts = new Map<string, number>();
    const tables = await Promise.all(
      tableNames.map(async (tableName: string) => {
        const tableColumns = columns.filter(
          column => column.tableName === tableName
        );
        const baseSlug = `ms3-${this.toSlug(tableName)}`;
        const slugCount = slugCounts.get(baseSlug) || 0;
        slugCounts.set(baseSlug, slugCount + 1);
        const slug = slugCount ? `${baseSlug}-${slugCount + 1}` : baseSlug;

        return {
          tableName,
          slug,
          name: `MS3 ${this.toTitle(tableName)}`,
          primaryKey: this.findPrimaryKey(tableColumns),
          columns: tableColumns,
          fields: tableColumns.map(column => this.mapColumnToField(column)),
          recordCount: await this.countRows(tableName),
        };
      })
    );

    this.metadataCache = {expiresAt: now + CACHE_MS, tables};
    return tables;
  }

  private async getColumns(tableNames: string[]): Promise<TableColumn[]> {
    if (!tableNames.length) {
      return [];
    }

    const [rows] = await this.pool.execute(
      `SELECT
         TABLE_NAME AS tableName,
         COLUMN_NAME AS columnName,
         ORDINAL_POSITION AS ordinalPosition,
         COLUMN_DEFAULT AS columnDefault,
         IS_NULLABLE AS isNullable,
         DATA_TYPE AS dataType,
         COLUMN_TYPE AS columnType,
         COLUMN_KEY AS columnKey,
         EXTRA AS extra
       FROM information_schema.COLUMNS
       WHERE TABLE_SCHEMA = ?
       ORDER BY TABLE_NAME, ORDINAL_POSITION`,
      [MS3_DATABASE]
    );

    return (rows as RowDataPacket[]).map((row: RowDataPacket) => ({
      tableName: String(row.tableName),
      columnName: String(row.columnName),
      ordinalPosition: Number(row.ordinalPosition),
      columnDefault: row.columnDefault == null ? null : String(row.columnDefault),
      isNullable: row.isNullable === 'YES' ? 'YES' : 'NO',
      dataType: String(row.dataType),
      columnType: String(row.columnType),
      columnKey: String(row.columnKey),
      extra: String(row.extra || ''),
    }));
  }

  private async countRows(tableName: string): Promise<number> {
    const [rows] = await this.pool.execute(
      `SELECT COUNT(*) AS total FROM ${this.escapeIdentifier(tableName)}`
    );
    return Number((rows as RowDataPacket[])[0]?.total || 0);
  }

  private async findTable(schemaSlug: string): Promise<TableMetadata> {
    const tables = await this.getMetadata();
    const table = tables.find(candidate => candidate.slug === schemaSlug);
    if (!table) {
      throw new NotFoundException(`MS3 schema "${schemaSlug}" not found`);
    }
    return table;
  }

  private async selectRows(table: TableMetadata): Promise<RowDataPacket[]> {
    const [rows] = await this.pool.execute(
      `SELECT * FROM ${this.escapeIdentifier(table.tableName)}`
    );
    return rows as RowDataPacket[];
  }

  private mapRowToRecord(
    table: TableMetadata,
    row: RowDataPacket
  ): DynamicRecordWire {
    const idColumn = table.primaryKey || table.columns[0]?.columnName;
    const now = new Date().toISOString();
    return {
      id: idColumn ? this.serializeId(row[idColumn]) : '',
      schemaId: `plugin:${PLUGIN_NAME}:${table.slug}`,
      data: this.mapRowData(row),
      createdAt: this.serializeDateCandidate(row.createdAt || row.created_at) || now,
      updatedAt: this.serializeDateCandidate(row.updatedAt || row.updated_at) || now,
    };
  }

  private mapRowData(row: RowDataPacket): Record<string, unknown> {
    return Object.fromEntries(
      Object.entries(row).map(([key, value]) => [key, this.serializeValue(value)])
    );
  }

  private mapColumnToField(column: TableColumn): DynamicSchemaField {
    const options = this.parseEnumOptions(column.columnType);

    return {
      name: column.columnName,
      label: this.toTitle(column.columnName),
      type: options.length ? 'select' : this.mapColumnType(column),
      required:
        column.isNullable === 'NO' &&
        column.columnDefault === null &&
        !column.extra.includes('auto_increment'),
      options: options.length ? options : undefined,
    };
  }

  private mapColumnType(column: TableColumn): DynamicSchemaField['type'] {
    const type = column.dataType.toLowerCase();
    if (
      ['int', 'bigint', 'smallint', 'mediumint', 'tinyint', 'decimal', 'double', 'float'].includes(type)
    ) {
      if (type === 'tinyint' && column.columnType === 'tinyint(1)') {
        return 'checkbox';
      }
      return 'number';
    }
    if (['date', 'datetime', 'timestamp', 'time', 'year'].includes(type)) {
      return 'date';
    }
    if (['text', 'mediumtext', 'longtext', 'json'].includes(type)) {
      return 'textarea';
    }
    return 'text';
  }

  private parseEnumOptions(
    columnType: string
  ): {label: string; value: string}[] {
    const match = columnType.match(/^enum\((.*)\)$/i);
    if (!match) {
      return [];
    }

    return match[1]
      .split(/,(?=(?:[^']*'[^']*')*[^']*$)/)
      .map(value => value.trim().replace(/^'|'$/g, '').replace(/\\'/g, "'"))
      .map(value => ({label: value, value}));
  }

  private getWritableColumns(
    table: TableMetadata,
    data: Record<string, unknown>
  ): TableColumn[] {
    return table.columns.filter(column => {
      if (!(column.columnName in data)) {
        return false;
      }
      return !column.extra.includes('auto_increment');
    });
  }

  private requirePrimaryKey(table: TableMetadata): string {
    if (!table.primaryKey) {
      throw new BadRequestException(
        `MS3 table "${table.tableName}" has no single primary key`
      );
    }
    return table.primaryKey;
  }

  private requireColumn(table: TableMetadata, columnName: string): void {
    if (!table.columns.some(column => column.columnName === columnName)) {
      throw new BadRequestException(
        `MS3 table "${table.tableName}" has no column "${columnName}"`
      );
    }
  }

  private findPrimaryKey(columns: TableColumn[]): string | undefined {
    const primaryKeys = columns.filter(column => column.columnKey === 'PRI');
    return primaryKeys.length === 1 ? primaryKeys[0].columnName : undefined;
  }

  private matchesFilters(
    row: RowDataPacket,
    filters?: Record<string, unknown>
  ): boolean {
    return Object.entries(filters || {}).every(([key, value]) => {
      if (value === undefined || value === null || value === '') return true;
      return (
        String(row[key] ?? '').toLowerCase() === String(value).toLowerCase()
      );
    });
  }

  private sortRows(
    rows: RowDataPacket[],
    query: DynamicRecordQueryInput
  ): RowDataPacket[] {
    const sortField = query.sortField;
    const sortDirection = query.sortDirection || 'DESC';
    if (!sortField) {
      return rows;
    }

    return [...rows].sort((left, right) => {
      const result = String(left[sortField] ?? '').localeCompare(
        String(right[sortField] ?? '')
      );
      return sortDirection === 'ASC' ? result : -result;
    });
  }

  private escapeIdentifier(identifier: string): string {
    return `\`${identifier.replace(/`/g, '``')}\``;
  }

  private serializeValue(value: unknown): unknown {
    if (value instanceof Date) {
      return value.toISOString();
    }
    if (Buffer.isBuffer(value)) {
      return value.toString('base64');
    }
    return value;
  }

  private serializeId(value: unknown): number | string {
    const serialized = this.serializeValue(value);
    if (typeof serialized === 'number' || typeof serialized === 'string') {
      return serialized;
    }
    return String(serialized ?? '');
  }

  private serializeDateCandidate(value: unknown): string | undefined {
    const serialized = this.serializeValue(value);
    return typeof serialized === 'string' ? serialized : undefined;
  }

  private toSlug(value: string): string {
    return value
      .trim()
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/_/g, '-')
      .replace(/[^a-z0-9-]+/g, '')
      .replace(/^-+|-+$/g, '');
  }

  private toTitle(value: string): string {
    return value
      .replace(/[_-]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
      .replace(/\b\w/g, match => match.toUpperCase());
  }
}

@Injectable()
class Ms3DatabasePluginRegistrar implements OnModuleInit {
  constructor(
    @Inject(GUSTAV_PLUGIN_SCHEMA_REGISTRY)
    private readonly registry: PluginSchemaRegistry,
    private readonly provider: Ms3DatabaseSchemaProvider
  ) {}

  onModuleInit(): void {
    this.registry.registerProvider(this.provider);
  }
}

@Module({
  providers: [Ms3DatabaseSchemaProvider, Ms3DatabasePluginRegistrar],
})
export class PluginBackendModule {}
