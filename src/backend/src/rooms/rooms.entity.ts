import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['building', 'roomNumber'])
export class Room {
    @PrimaryGeneratedColumn()
    roomID: number;
    
    @Column()
    building: string;

    @Column()
    roomNumber: string;

    @Column()
    capacity: number;
}