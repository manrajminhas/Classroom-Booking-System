import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, Index } from 'typeorm';

@Entity()
export class Log {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  action: string;

  @Column()
  userId: number;

  @Column({ type: 'varchar', nullable: true })
  actorUsername: string | null;

  @Column({ type: 'varchar', nullable: true })
  targetType: string | null;

  @Column({ type: 'varchar', nullable: true })
  targetId: string | null;

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb',
    nullable: true,
  })
  before: Record<string, any> | null;

  @Column({
    type: process.env.NODE_ENV === 'test' ? 'simple-json' : 'jsonb',
    nullable: true,
  })
  after: Record<string, any> | null;

  @Column({ type: 'varchar', nullable: true })
  reason: string | null;

  @Column({ type: 'text', nullable: true })
  details: string | null;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
