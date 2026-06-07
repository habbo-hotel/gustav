import {BaseSDK} from '@gustav/sdk';
import {
  HabboUser,
  HabboRoom,
  HabboCatalogPage,
  HabboGuild,
} from './types';
import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
} from '@gustav/types';

export class HabboSDK extends BaseSDK {
  // Users
  async getUsers(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: HabboUser})[];
    total: number;
  }> {
    return this.post('/habbo/users/query', query || {});
  }

  async getUser(id: number | string): Promise<DynamicRecordWire & {data: HabboUser}> {
    return this.get(`/habbo/users/${id}`);
  }

  // Rooms
  async getRooms(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: HabboRoom})[];
    total: number;
  }> {
    return this.post('/habbo/rooms/query', query || {});
  }

  async getRoom(id: number | string): Promise<DynamicRecordWire & {data: HabboRoom}> {
    return this.get(`/habbo/rooms/${id}`);
  }

  // Catalog
  async getCatalogPages(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: HabboCatalogPage})[];
    total: number;
  }> {
    return this.post('/habbo/catalog/query', query || {});
  }

  // Guilds
  async getGuilds(query?: DynamicRecordQueryInput): Promise<{
    records: (DynamicRecordWire & {data: HabboGuild})[];
    total: number;
  }> {
    return this.post('/habbo/guilds/query', query || {});
  }
}
