import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Room } from 'src/rooms/rooms.entity';

@Injectable()
export class HealthService {
  constructor(private dataSource: DataSource) {}

  // Quick DB reachability check
  async dbPing(): Promise<boolean> {
    try {
      await this.dataSource.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  // Readiness gate: consider the system "seeded" if at least one room exists.
  // Needs a more explicit flag/table later.
  async isSeeded(): Promise<boolean> {
    try {
      const repo = this.dataSource.getRepository(Room);
      const count = await repo.count();
      return count > 0;
    } catch {
      return false;
    }
  }
}
