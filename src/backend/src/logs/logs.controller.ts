import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Log } from './logs.entity';
//mport { Roles } from '../users/roles.decorator';
//import { RolesGuard } from '../users/roles.guard';
//import { UserRole } from '../users/users.entity';

type CreateLogBody = {
  userId: number;
  action: string;
  actorUsername: string | null;
  targetType: string | null;
  targetId: string | null;
  before: Record<string, any> | null;
  after: Record<string, any> | null;
  reason: string | null;
  details: string | null;
};

@Controller('logs')
//@UseGuards(RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  async getLogs(): Promise<Log[]> {
    return this.logsService.getAllLogs();
  }

  @Get('filter')
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

  @Post()
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