import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, FindOptionsWhere } from 'typeorm';
import { Log } from './logs.entity';

type CreateLogInput = {
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

export type AuditInput = {
  actorId: number;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  before?: Record<string, any> | null;
  after?: Record<string, any> | null;
  reason?: string | null;
  details?: string | null;
};

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(Log)
    private readonly logRepository: Repository<Log>,
  ) {}

  /** Creates and saves a log entry. */
  async createLog(input: CreateLogInput): Promise<Log> {
    const log = this.logRepository.create({
      userId: input.userId,
      action: input.action,
      actorUsername: input.actorUsername,
      targetType: input.targetType,
      targetId: input.targetId,
      before: input.before,
      after: input.after,
      reason: input.reason,
      details: input.details,
    });
    return this.logRepository.save(log);
  }

  /** Retrieves all logs, ordered by creation date descending. */
  async getAllLogs(): Promise<Log[]> {
    return this.logRepository.find({ order: { createdAt: 'DESC' } });
  }

  /** Logs an audit event. */
  async logAudit(input: AuditInput): Promise<Log> {
    return this.createLog({
      userId: input.actorId,
      action: input.action,
      actorUsername: input.actorName,
      targetType: input.targetType,
      targetId: input.targetId,
      before: input.before ?? null,
      after: input.after ?? null,
      reason: input.reason ?? null,
      details: input.details ?? null,
    });
  }

  /** Retrieves logs filtered by the given parameters. */
  async getLogsFiltered(params: {
    actorUsername: string | null;
    action: string | null;
    from: Date | null;
    to: Date | null;
  }): Promise<Log[]> {
    const where: FindOptionsWhere<Log> = {};

    if (params.actorUsername !== null) {
      where.actorUsername = params.actorUsername;
    }
    if (params.action !== null) {
      where.action = params.action;
    }
    if (params.from !== null && params.to !== null) {
      where.createdAt = Between(params.from, params.to);
    } else if (params.from !== null) {
      where.createdAt = Between(params.from, new Date(8640000000000000));
    } else if (params.to !== null) {
      where.createdAt = Between(new Date(0), params.to);
    }

    return this.logRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });
  }

  /** Retrieves logs whose actions start with any of the given prefixes. */
  async getLogsFilteredByActions(prefixes: string[]): Promise<Log[]> {
    const qb = this.logRepository.createQueryBuilder('log');
    qb.where(
      prefixes
        .map((p, i) => `log.action LIKE :prefix${i}`)
        .join(' OR '),
      Object.fromEntries(prefixes.map((p, i) => [`prefix${i}`, `${p}%`]))
    );
    qb.orderBy('log.createdAt', 'DESC');
    return qb.getMany();
  }
}
