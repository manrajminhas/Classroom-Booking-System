import { Controller, Get, UseGuards } from '@nestjs/common';
import { LogsService } from './logs.service';
import { Roles } from 'src/users/roles.decorator';
import { RolesGuard } from 'src/users/roles.guard';
import { UserRole } from 'src/users/users.entity';

@Controller('logs')
@UseGuards(RolesGuard)
export class LogsController {
  constructor(private readonly logsService: LogsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.REGISTRAR)
  async getLogs() {
    return this.logsService.getAllLogs();
  }
}