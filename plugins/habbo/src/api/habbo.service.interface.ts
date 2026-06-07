import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
} from '@gustav/types';

export interface HabboService {
  // Users
  queryUsers(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
  getUser(id: number | string): Promise<DynamicRecordWire>;

  // Rooms
  queryRooms(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
  getRoom(id: number | string): Promise<DynamicRecordWire>;

  // Catalog
  queryCatalogPages(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;

  // Guilds
  queryGuilds(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
}

export const HABBO_SERVICE = 'HABBO_SERVICE';
