import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
} from '@gustav/types';
import {SchemaSDK} from '@gustav/sdk';
import {MS3User, MS3Room, MS3CatalogPage, MS3Guild} from './types';

export const MS3_SLUGS = {
  USERS: 'ms3-users',
  ROOMS: 'ms3-rooms',
  CATALOG_PAGES: 'ms3-catalog-pages',
  GUILDS: 'ms3-guilds',
} as const;

export class MS3SDK {
  constructor(private readonly schemaSdk: SchemaSDK) {}

  // Users
  async getUsers(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: MS3User})[];
    total: number;
  }> {
    const result = await this.schemaSdk.queryRecords(MS3_SLUGS.USERS, query || {});
    return result as any;
  }

  async getUser(id: number | string): Promise<DynamicRecordWire & {data: MS3User}> {
    const record = await this.schemaSdk.findRecord(MS3_SLUGS.USERS, id);
    return record as any;
  }

  // Rooms
  async getRooms(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: MS3Room})[];
    total: number;
  }> {
    const result = await this.schemaSdk.queryRecords(MS3_SLUGS.ROOMS, query || {});
    return result as any;
  }

  async getRoom(id: number | string): Promise<DynamicRecordWire & {data: MS3Room}> {
    const record = await this.schemaSdk.findRecord(MS3_SLUGS.ROOMS, id);
    return record as any;
  }

  // Catalog Pages
  async getCatalogPages(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: MS3CatalogPage})[];
    total: number;
  }> {
    const result = await this.schemaSdk.queryRecords(MS3_SLUGS.CATALOG_PAGES, query || {});
    return result as any;
  }

  // Guilds
  async getGuilds(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: MS3Guild})[];
    total: number;
  }> {
    const result = await this.schemaSdk.queryRecords(MS3_SLUGS.GUILDS, query || {});
    return result as any;
  }

  // Generic Query (if needed for other tables)
  async queryTable<T = any>(
    slug: string,
    query: DynamicRecordQueryInput
  ): Promise<DynamicRecordQueryWire & {records: (DynamicRecordWire & {data: T})[]}> {
    const result = await this.schemaSdk.queryRecords(slug, query);
    return result as any;
  }
}
