import { Controller, Get } from '@nestjs/common';
import { HealthWire } from '@gustav/types';

@Controller('health')
export class HealthController {
  @Get()
  check(): HealthWire {
    return { status: 'ok', timestamp: new Date().toISOString() };
  }
}
