import {
  Module,
  Global,
  OnModuleInit,
  Inject,
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {createPool, RowDataPacket} from 'mysql2/promise';
import {
  DynamicRecordInput,
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
  DynamicSchemaField,
  PluginDynamicSchemaDefinition,
  PluginSchemaProvider,
  GUSTAV_PLUGIN_SCHEMA_REGISTRY,
  PluginSchemaRegistry,
} from '@gustav/types';
import {HabboService, HabboRegistry} from '@gustav/habbo-plugin/backend';

const MS3_SLUGS = {
  USERS: 'ms3-users',
  ROOMS: 'ms3-rooms',
  CATALOG_PAGES: 'ms3-catalog-pages',
  GUILDS: 'ms3-guilds',
} as const;

const PLUGIN_NAME = '@gustav/habbo-arcturus-plugin';
const MS3_DATABASE = process.env.MS3_DB_NAME || 'ms3';

interface TableColumn {
  tableName: string;
  columnName: string;
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
}

const EXPLICIT_TABLES: TableMetadata[] = [
  {
    tableName: 'users',
    slug: MS3_SLUGS.USERS,
    name: 'MS3 Users',
    primaryKey: 'id',
    columns: [
      { tableName: 'users', columnName: 'id', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: 'PRI', extra: 'auto_increment' },
      { tableName: 'users', columnName: 'username', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(25)', columnKey: 'UNI', extra: '' },
      { tableName: 'users', columnName: 'real_name', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(25)', columnKey: '', extra: '' },
      { tableName: 'users', columnName: 'mail', isNullable: 'YES', dataType: 'varchar', columnType: 'varchar(500)', columnKey: '', extra: '' },
      { tableName: 'users', columnName: 'motto', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(127)', columnKey: '', extra: '' },
      { tableName: 'users', columnName: 'rank', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: '', extra: '' },
      { tableName: 'users', columnName: 'credits', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: '', extra: '' },
      { tableName: 'users', columnName: 'online', isNullable: 'NO', dataType: 'enum', columnType: "enum('0','1','2')", columnKey: '', extra: '' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: false },
      { name: 'username', label: 'Username', type: 'text', required: true },
      { name: 'real_name', label: 'Real Name', type: 'text', required: true },
      { name: 'mail', label: 'Mail', type: 'text', required: false },
      { name: 'motto', label: 'Motto', type: 'text', required: true },
      { name: 'rank', label: 'Rank', type: 'number', required: true },
      { name: 'credits', label: 'Credits', type: 'number', required: true },
      { name: 'online', label: 'Online Status', type: 'select', required: true, options: [{label: 'Offline', value: '0'}, {label: 'Online', value: '1'}, {label: 'Hidden', value: '2'}] },
    ]
  },
  {
    tableName: 'rooms',
    slug: MS3_SLUGS.ROOMS,
    name: 'MS3 Rooms',
    primaryKey: 'id',
    columns: [
      { tableName: 'rooms', columnName: 'id', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: 'PRI', extra: 'auto_increment' },
      { tableName: 'rooms', columnName: 'owner_name', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(25)', columnKey: '', extra: '' },
      { tableName: 'rooms', columnName: 'name', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(50)', columnKey: '', extra: '' },
      { tableName: 'rooms', columnName: 'description', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(512)', columnKey: '', extra: '' },
      { tableName: 'rooms', columnName: 'users', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: '', extra: '' },
      { tableName: 'rooms', columnName: 'users_max', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: '', extra: '' },
      { tableName: 'rooms', columnName: 'state', isNullable: 'NO', dataType: 'enum', columnType: "enum('open','locked','password','invisible')", columnKey: '', extra: '' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: false },
      { name: 'owner_name', label: 'Owner', type: 'text', required: true },
      { name: 'name', label: 'Room Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'users', label: 'Current Users', type: 'number', required: true },
      { name: 'users_max', label: 'Max Users', type: 'number', required: true },
      { name: 'state', label: 'State', type: 'select', required: true, options: [{label: 'Open', value: 'open'}, {label: 'Locked', value: 'locked'}, {label: 'Password', value: 'password'}, {label: 'Invisible', value: 'invisible'}] },
    ]
  },
  {
    tableName: 'catalog_pages',
    slug: MS3_SLUGS.CATALOG_PAGES,
    name: 'MS3 Catalog Pages',
    primaryKey: 'id',
    columns: [
      { tableName: 'catalog_pages', columnName: 'id', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: 'PRI', extra: 'auto_increment' },
      { tableName: 'catalog_pages', columnName: 'caption', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(128)', columnKey: '', extra: '' },
      { tableName: 'catalog_pages', columnName: 'page_layout', isNullable: 'NO', dataType: 'enum', columnType: "enum('default_3x3','frontpage','guilds','bots','pets')", columnKey: '', extra: '' },
      { tableName: 'catalog_pages', columnName: 'visible', isNullable: 'NO', dataType: 'enum', columnType: "enum('0','1')", columnKey: '', extra: '' },
      { tableName: 'catalog_pages', columnName: 'enabled', isNullable: 'NO', dataType: 'enum', columnType: "enum('0','1')", columnKey: '', extra: '' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: false },
      { name: 'caption', label: 'Caption', type: 'text', required: true },
      { name: 'page_layout', label: 'Layout', type: 'select', required: true, options: [{label: 'Default 3x3', value: 'default_3x3'}, {label: 'Frontpage', value: 'frontpage'}, {label: 'Guilds', value: 'guilds'}, {label: 'Bots', value: 'bots'}, {label: 'Pets', value: 'pets'}] },
      { name: 'visible', label: 'Visible', type: 'checkbox', required: true },
      { name: 'enabled', label: 'Enabled', type: 'checkbox', required: true },
    ]
  },
  {
    tableName: 'guilds',
    slug: MS3_SLUGS.GUILDS,
    name: 'MS3 Guilds',
    primaryKey: 'id',
    columns: [
      { tableName: 'guilds', columnName: 'id', isNullable: 'NO', dataType: 'int', columnType: 'int(11)', columnKey: 'PRI', extra: 'auto_increment' },
      { tableName: 'guilds', columnName: 'name', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(50)', columnKey: '', extra: '' },
      { tableName: 'guilds', columnName: 'description', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(250)', columnKey: '', extra: '' },
      { tableName: 'guilds', columnName: 'badge', isNullable: 'NO', dataType: 'varchar', columnType: 'varchar(256)', columnKey: '', extra: '' },
    ],
    fields: [
      { name: 'id', label: 'ID', type: 'number', required: false },
      { name: 'name', label: 'Guild Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea', required: true },
      { name: 'badge', label: 'Badge Code', type: 'text', required: true },
    ]
  }
];

@Injectable()
export class ArcturusHabboService implements HabboService, PluginSchemaProvider {
  pluginName = PLUGIN_NAME;

  private readonly pool: any;

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

  // HabboService Implementation
  async queryUsers(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    const result = await this.queryRecords(MS3_SLUGS.USERS, query);
    return {
      ...result,
      records: result.records.map(r => ({
        ...r,
        data: this.mapToHabboUser(r.data as any),
      })),
    };
  }

  async getUser(id: number | string): Promise<DynamicRecordWire> {
    const record = await this.findRecord(MS3_SLUGS.USERS, id);
    return {
      ...record,
      data: this.mapToHabboUser(record.data as any),
    };
  }

  async queryRooms(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    const result = await this.queryRecords(MS3_SLUGS.ROOMS, query);
    return {
      ...result,
      records: result.records.map(r => ({
        ...r,
        data: this.mapToHabboRoom(r.data as any),
      })),
    };
  }

  async getRoom(id: number | string): Promise<DynamicRecordWire> {
    const record = await this.findRecord(MS3_SLUGS.ROOMS, id);
    return {
      ...record,
      data: this.mapToHabboRoom(record.data as any),
    };
  }

  async queryCatalogPages(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    const result = await this.queryRecords(MS3_SLUGS.CATALOG_PAGES, query);
    return {
      ...result,
      records: result.records.map(r => ({
        ...r,
        data: this.mapToHabboCatalogPage(r.data as any),
      })),
    };
  }

  async queryGuilds(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    const result = await this.queryRecords(MS3_SLUGS.GUILDS, query);
    return {
      ...result,
      records: result.records.map(r => ({
        ...r,
        data: this.mapToHabboGuild(r.data as any),
      })),
    };
  }

  // Mapper helpers
  private mapToHabboUser(data: any): any {
    return {
      id: data.id,
      username: data.username,
      motto: data.motto,
      look: data.look,
      rank: data.rank,
      credits: data.credits,
      online: data.online !== '0',
      createdAt: data.account_created,
      lastLogin: data.last_login,
    };
  }

  private mapToHabboRoom(data: any): any {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      ownerName: data.owner_name,
      ownerId: data.owner_id,
      usersNow: data.users,
      usersMax: data.users_max,
      state: data.state,
    };
  }

  private mapToHabboCatalogPage(data: any): any {
    return {
      id: data.id,
      parentId: data.parent_id,
      caption: data.caption,
      pageLayout: data.page_layout,
      visible: data.visible === '1',
      enabled: data.enabled === '1',
    };
  }

  private mapToHabboGuild(data: any): any {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      ownerId: data.user_id,
      badge: data.badge,
    };
  }

  // PluginSchemaProvider Implementation
  async findSchemas(): Promise<PluginDynamicSchemaDefinition[]> {
    const now = new Date().toISOString();

    return Promise.all(EXPLICIT_TABLES.map(async table => ({
      pluginName: PLUGIN_NAME,
      name: table.name,
      slug: table.slug,
      description: `MS3 table: ${table.tableName}`,
      folder: 'Habbo Arcturus',
      fields: table.fields,
      recordCount: await this.countRows(table.tableName),
      readOnly: !table.primaryKey,
      createdAt: now,
      updatedAt: now,
    })));
  }

  async queryRecords(
    schemaSlug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire> {
    const table = this.findTable(schemaSlug);
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
    const table = this.findTable(schemaSlug);
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
    const table = this.findTable(schemaSlug);
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
    const table = this.findTable(schemaSlug);
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
    const id = input.data[primaryKey] ?? (result as any).insertId;

    return this.findRecord(schemaSlug, id);
  }

  async updateRecord(
    schemaSlug: string,
    id: number | string,
    input: DynamicRecordInput
  ): Promise<DynamicRecordWire> {
    const table = this.findTable(schemaSlug);
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
    const table = this.findTable(schemaSlug);
    const primaryKey = this.requirePrimaryKey(table);
    await this.pool.execute(
      `DELETE FROM ${this.escapeIdentifier(table.tableName)} WHERE ${this.escapeIdentifier(primaryKey)} = ?`,
      [id]
    );
  }

  private async countRows(tableName: string): Promise<number> {
    const [rows] = await this.pool.execute(
      `SELECT COUNT(*) AS total FROM ${this.escapeIdentifier(tableName)}`
    );
    return Number((rows as RowDataPacket[])[0]?.total || 0);
  }

  private findTable(schemaSlug: string): TableMetadata {
    const table = EXPLICIT_TABLES.find(candidate => candidate.slug === schemaSlug);
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
}

@Global()
@Module({
  providers: [ArcturusHabboService],
  exports: [ArcturusHabboService],
})
export class PluginBackendModule implements OnModuleInit {
  constructor(
    @Inject(GUSTAV_PLUGIN_SCHEMA_REGISTRY)
    private readonly schemaRegistry: PluginSchemaRegistry,
    private readonly habboRegistry: HabboRegistry,
    private readonly arcturusService: ArcturusHabboService
  ) {}

  onModuleInit() {
    this.habboRegistry.registerImplementation(this.arcturusService);
    this.schemaRegistry.registerProvider(this.arcturusService);
  }
}
