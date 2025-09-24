import { Entity, PrimaryColumn, Column } from 'typeorm';

@Entity()
export class Room {
    @PrimaryColumn()
    building: string;

    @PrimaryColumn()
    roomNumber: string;

    @Column()
    capacity: number;
}