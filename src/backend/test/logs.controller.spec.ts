import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { LogsController } from 'src/logs/logs.controller';
import { LogsService } from 'src/logs/logs.service';

describe('LogsController', () => {
	let controller: LogsController;

	const mockLogsService = {
		getAllLogs: vi.fn(),
		getLogsFiltered: vi.fn(),
		getLogsFilteredByActions: vi.fn(),
		createLog: vi.fn(),
	} as unknown as LogsService;

	beforeEach(() => {
		controller = new LogsController(mockLogsService);
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('should be defined', () => {
		expect(controller).toBeDefined();
	});

	it('getLogs should return all logs', async () => {
		const logs = [{ id: 1 }, { id: 2 }];
		mockLogsService.getAllLogs = vi.fn().mockResolvedValue(logs);
		const res = await controller.getLogs();
		expect(res).toEqual(logs);
		expect(mockLogsService.getAllLogs).toHaveBeenCalledOnce();
	});

	it('getLogsFiltered should parse dates', async () => {
		mockLogsService.getLogsFiltered = vi.fn().mockResolvedValue([]);
		const from = '2025-01-01';
		const to = '2025-02-02';

		await controller.getLogsFiltered('alice', 'act', from, to);

		expect(mockLogsService.getLogsFiltered).toHaveBeenCalledWith({
			actorUsername: 'alice',
			action: 'act',
			from: new Date(from),
			to: new Date(to),
		});
	});

	it('getRegistrarLogs should call getLogsFilteredByActions with correct prefixes', async () => {
		const expected = [{ id: 1 }];
		mockLogsService.getLogsFilteredByActions = vi.fn().mockResolvedValue(expected as any);
		const res = await controller.getRegistrarLogs();
		expect(mockLogsService.getLogsFilteredByActions).toHaveBeenCalledWith(['booking.', 'room.']);
		expect(res).toEqual(expected);
	});

	it('getAdminLogs should return all logs', async () => {
		const expected = [{ id: 5 }];
		mockLogsService.getAllLogs = vi.fn().mockResolvedValue(expected as any);
		const res = await controller.getAdminLogs();
		expect(mockLogsService.getAllLogs).toHaveBeenCalledOnce();
		expect(res).toEqual(expected);
	});

	it('addLog should map body fields and call createLog', async () => {
		const body = {
			userId: 3,
			action: 'x.y',
			actorUsername: undefined,
			targetType: undefined,
			targetId: undefined,
			before: undefined,
			after: undefined,
			reason: undefined,
			details: 'd',
		} as any;

		const created = { id: 9 } as any;
		mockLogsService.createLog = vi.fn().mockResolvedValue(created);

		const res = await controller.addLog(body);
		expect(mockLogsService.createLog).toHaveBeenCalledWith({
			userId: 3,
			action: 'x.y',
			actorUsername: null,
			targetType: null,
			targetId: null,
			before: null,
			after: null,
			reason: null,
			details: 'd',
		});
		expect(res).toEqual(created);
	});
});