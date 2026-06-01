import {HealthWire} from '@gustav/types';
import {Controller, Get} from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get('status')
  check(): HealthWire {
    return {status: 'ok', timestamp: new Date().toISOString()};
  }
}
