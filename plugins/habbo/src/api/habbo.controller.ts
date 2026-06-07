import {
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {HabboRegistry} from './habbo.registry.js';
import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
} from '@gustav/types';

@Controller('habbo')
export class HabboController {
  constructor(private readonly registry: HabboRegistry) {}

  @Post('users/query')
  async queryUsers(@Body() query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    return this.registry.getImplementation().queryUsers(query);
  }

  @Get('users/:id')
  async getUser(@Param('id') id: string): Promise<DynamicRecordWire> {
    return this.registry.getImplementation().getUser(id);
  }

  @Post('rooms/query')
  async queryRooms(@Body() query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    return this.registry.getImplementation().queryRooms(query);
  }

  @Get('rooms/:id')
  async getRoom(@Param('id') id: string): Promise<DynamicRecordWire> {
    return this.registry.getImplementation().getRoom(id);
  }

  @Post('catalog/query')
  async queryCatalogPages(@Body() query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    return this.registry.getImplementation().queryCatalogPages(query);
  }

  @Post('guilds/query')
  async queryGuilds(@Body() query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire> {
    return this.registry.getImplementation().queryGuilds(query);
  }
}
