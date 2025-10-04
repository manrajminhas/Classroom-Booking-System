import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Log } from './logs.entity';

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  async createLog(userId: number, action: string, details: string): Promise<Log> {
    const log = this.logRepository.create({ userId, action, details });
    return this.logRepository.save(log);
  }

  async getAllLogs(): Promise<Log[]> {
    return this.logRepository.find({ order: { createdAt: 'DESC' } });
  }
}