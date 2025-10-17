import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthService } from './health.service';

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(private readonly health: HealthService) {}

  // Liveness: app process is up
  @Get('health')
  @ApiOperation({ summary: 'Liveness probe (app is up)' })
  @ApiResponse({ status: 200, description: 'Service is running' })
  healthz() {
    return {
      status: 'ok',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    };
  }

  // Readiness: can accept traffic (DB ok, seed/import done)
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe (dependencies OK and seeded)' })
  @ApiResponse({ status: 200, description: 'Service is ready to accept traffic' })
  @ApiResponse({ status: 503, description: 'Service is not ready' })
  async readyz() {
    const db = await this.health.dbPing();
    const seeded = await this.health.isSeeded();

    const details = {
      app: 'ok',
      db: db ? 'ok' : 'down',
      seed: seeded ? 'ok' : 'pending',
      timestamp: new Date().toISOString(),
    };

    if (!db || !seeded) {
      throw new ServiceUnavailableException({ status: 'not-ready', ...details });
    }

    return { status: 'ready', ...details };
  }
}
