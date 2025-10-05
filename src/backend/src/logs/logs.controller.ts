import { Controller, Get, Post, Body } from '@nestjs/common';
import { LogsService } from './logs.service';
//mport { Roles } from '../users/roles.decorator';
//import { RolesGuard } from '../users/roles.guard';
//import { UserRole } from '../users/users.entity';

@Controller('logs')
//@UseGuards(RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  //@Roles(UserRole.ADMIN, UserRole.REGISTRAR)
  async getLogs() {
    return this.logsService.getAllLogs();
  }

  @Post()
  async addLog(
    @Body() body: { userId: number; action: string; details: string },
  ) {
    return this.logsService.createLog(body.userId, body.action, body.details);
  }
}