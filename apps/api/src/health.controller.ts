import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  health() {
    return {
      status: 'ok',
      database: 'not-connected',
      redis: 'not-connected',
      cfxProvider: 'not-configured',
    };
  }
}
