import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource, Repository } from 'typeorm';
import { LogsService } from 'src/logs/logs.service';
import { Log } from 'src/logs/logs.entity';

describe('LogsService', () => {
    let dataSource: DataSource;
    let logsRepository: Repository<Log>;
    let logsService: LogsService;

    beforeEach(async () => {
        dataSource = new DataSource({
        type: 'sqlite',
        database: 'memory',
        synchronize: true,
        dropSchema: true,
        entities: [Log]
    });
        await dataSource.initialize();

        logsRepository = dataSource.getRepository(Log);
        logsService = new LogsService(logsRepository);
    });

    afterEach(async () => {
        await dataSource.destroy();
    });

    it('should be defined', () => {
        expect(logsService).toBeDefined();
    });

    it('should create and return a log', async () => {
        const input = {
        userId: 1,
        action: 'test.action',
        actorUsername: 'a',
        targetType: 'thing',
        targetId: '42',
        before: { a: 1 },
        after: { a: 2 },
        reason: 'reason',
        details: 'details',
        };

        const result = await logsService.createLog(input);
        expect(result).toHaveProperty('id');
        expect(result.action).toBe('test.action');
        expect(result.userId).toBe(1);
        expect(result.actorUsername).toBe('a');
        expect(result.before).toEqual({ a: 1 });
    });

    it('should call createLog and map fields', async () => {
        const res = await logsService.logAudit({
        actorId: 7,
        actorName: 'abc',
        action: 'booking.create',
        targetType: 'booking',
        targetId: '100',
        before: null,
        after: { bookingID: 100 },
        details: 'created',
        });

        expect(res.userId).toBe(7);
        expect(res.actorUsername).toBe('abc');
        expect(res.action).toBe('booking.create');
        expect(res.after).toEqual({ bookingID: 100 });
    });

    it('should return logs in descending order', async () => {
        const l1 = await logsRepository.save({ action: 'a', userId: 1, createdAt: new Date('2025-01-01') });
        const l2 = await logsRepository.save({ action: 'b', userId: 2, createdAt: new Date('2025-02-01') });

        const all = await logsService.getAllLogs();
        expect(all[0].id).toBe(l2.id);
        expect(all[1].id).toBe(l1.id);
    });

    it('should filter by actorUsername, action and date ranges', async () => {
        await logsRepository.save({ action: 'booking.create', userId: 1, actorUsername: 'x', createdAt: new Date('2025-01-01') });
        await logsRepository.save({ action: 'room.update', userId: 2, actorUsername: 'y', createdAt: new Date('2025-06-01') });
        await logsRepository.save({ action: 'booking.delete', userId: 3, actorUsername: 'x', createdAt: new Date('2025-07-01') });

        const byActor = await logsService.getLogsFiltered({ actorUsername: 'x', action: null, from: null, to: null });
        expect(byActor).toHaveLength(2);
        expect(byActor[0].actorUsername).toBe('x');

        const byAction = await logsService.getLogsFiltered({ actorUsername: null, action: 'room.update', from: null, to: null });
        expect(byAction).toHaveLength(1);
        expect(byAction[0].action).toBe('room.update');

        const from = new Date('2025-05-01');
        const to = new Date('2025-08-01');
        const byDate = await logsService.getLogsFiltered({ actorUsername: null, action: null, from, to });
        expect(byDate).toHaveLength(2);
        for (const l of byDate) {
            expect(l.createdAt >= from && l.createdAt <= to).toBeTruthy();
        }
    });

    it('getLogsFilteredByActions should return logs matching prefixes', async () => {
        await logsRepository.save({ action: 'booking.create', userId: 1, createdAt: new Date('2025-03-01') });
        await logsRepository.save({ action: 'booking.delete', userId: 2, createdAt: new Date('2025-04-01') });
        await logsRepository.save({ action: 'room.update', userId: 3, createdAt: new Date('2025-05-01') });

        const res = await logsService.getLogsFilteredByActions(['booking.']);
        expect(res).toHaveLength(2);
        expect(res[0].action.startsWith('booking.')).toBe(true);
    });

    it('returns empty arrays when no logs match', async () => {
        const all = await logsService.getAllLogs();
        expect(all).toEqual([]);

        const byActor = await logsService.getLogsFiltered({ actorUsername: 'noone', action: null, from: null, to: null });
        expect(byActor).toHaveLength(0);

        const byActions = await logsService.getLogsFilteredByActions(['nonsense.']);
        expect(byActions).toHaveLength(0);
    });
});
