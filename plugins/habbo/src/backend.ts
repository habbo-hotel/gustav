import {
  Module,
  Global,
  Injectable,
  OnModuleInit,
  InternalServerErrorException,
  Controller,
  Get,
  Post,
  Body,
  Param,
} from '@nestjs/common';
import {
  DynamicRecordQueryInput,
  DynamicRecordQueryWire,
  DynamicRecordWire,
} from '@gustav/types';

export interface HabboService {
  queryUsers(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
  getUser(id: number | string): Promise<DynamicRecordWire>;
  queryRooms(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
  getRoom(id: number | string): Promise<DynamicRecordWire>;
  queryCatalogPages(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
  queryGuilds(query: DynamicRecordQueryInput): Promise<DynamicRecordQueryWire>;
}

export const HABBO_SERVICE = 'HABBO_SERVICE';

@Injectable()
export class HabboRegistry implements OnModuleInit {
  private implementation: HabboService | null = null;

  registerImplementation(service: HabboService) {
    if (this.implementation) {
      throw new InternalServerErrorException(
        'Habbo implementation already registered. Only one Habbo database plugin can be active.'
      );
    }
    this.implementation = service;
  }

  getImplementation(): HabboService {
    if (!this.implementation) {
      throw new InternalServerErrorException(
        'No Habbo implementation registered. Please ensure a Habbo database plugin is installed.'
      );
    }
    return this.implementation;
  }

  onModuleInit() {}
}

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

@Global()
@Module({
  providers: [HabboRegistry],
  controllers: [HabboController],
  exports: [HabboRegistry],
})
export class PluginBackendModule {}
