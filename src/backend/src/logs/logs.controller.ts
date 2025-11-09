//mport { Roles } from '../users/roles.decorator';
//import { RolesGuard } from '../users/roles.guard';
//import { UserRole } from '../users/users.entity';

import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from './logs.entity';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';

type CreateLogBody = {
  userId: number;
  action: string;
  actorUsername?: string | null;
  targetType?: string | null;
  targetId?: string | null;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  reason?: string | null;
  details?: string | null;
};

@ApiTags('logs')
@Controller('logs')
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all logs' })
  @ApiResponse({ status: 200, description: 'List of logs', type: Log, isArray: true })
  async getLogs(): Promise<Log[]> {
    return this.logsService.getAllLogs();
  }

  @Get('filter')
  @ApiOperation({ summary: 'Get logs filtered by actor, action and date range', description: 'Query params: actorUsername (optional), action (optional), from (ISO date, optional), to (ISO date, optional)' })
  @ApiResponse({ status: 200, description: 'Filtered logs', type: Log, isArray: true })
  async getLogsFiltered(
    @Query('actorUsername') actorUsername: string | null = null,
    @Query('action') action: string | null = null,
    @Query('from') fromStr: string | null = null,
    @Query('to') toStr: string | null = null,
  ): Promise<Log[]> {
    const from = fromStr ? new Date(fromStr) : null;
    const to = toStr ? new Date(toStr) : null;
    return this.logsService.getLogsFiltered({ actorUsername, action, from, to });
  }

  @Get('registrar')
  @ApiOperation({ summary: 'Get registrar-related logs (booking.* and room.*)' })
  @ApiResponse({ status: 200, description: 'Registrar logs', type: Log, isArray: true })
  async getRegistrarLogs(): Promise<Log[]> {
    return this.logsService.getLogsFilteredByActions(['booking.', 'room.']);
  }

  @Get('admin')
  @ApiOperation({ summary: 'Get admin logs (all logs)' })
  @ApiResponse({ status: 200, description: 'Admin logs', type: Log })
  async getAdminLogs(): Promise<Log[]> {
    return this.logsService.getAllLogs();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new log entry' })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        userId: { type: 'number' },
        action: { type: 'string' },
        actorUsername: { type: 'string', nullable: true },
        targetType: { type: 'string', nullable: true },
        targetId: { type: 'string', nullable: true },
        before: { type: 'object', nullable: true, additionalProperties: true },
        after: { type: 'object', nullable: true, additionalProperties: true },
        reason: { type: 'string', nullable: true },
        details: { type: 'string', nullable: true },
      },
      required: ['userId', 'action'],
    },
  })
  @ApiResponse({ status: 201, description: 'Created log', type: Log })
  async addLog(@Body() body: CreateLogBody): Promise<Log> {
    return this.logsService.createLog({
      userId: body.userId,
      action: body.action,
      actorUsername: body.actorUsername ?? null,
      targetType: body.targetType ?? null,
      targetId: body.targetId ?? null,
      before: body.before ?? null,
      after: body.after ?? null,
      reason: body.reason ?? null,
      details: body.details ?? null,
    });
  }
}