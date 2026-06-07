import {Injectable, OnModuleInit, InternalServerErrorException} from '@nestjs/common';
import {HabboService} from './habbo.service.interface.js';

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
        'No Habbo implementation registered. Please ensure a Habbo database plugin (e.g. ms3-database) is installed.'
      );
    }
    return this.implementation;
  }

  onModuleInit() {
    // We'll check this later in the lifecycle if needed, 
    // but usually the first request will trigger the check in getImplementation()
  }
}
