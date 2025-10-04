import { Booking } from 'src/bookings/bookings.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany, Check } from 'typeorm';

@Entity()
@Unique(['building', 'roomNumber'])
export class Room {
    @PrimaryGeneratedColumn()
    roomID: number;
    
    @Column({ type: 'varchar' })
    building: string;

    @Column({ type: 'varchar' })
    roomNumber: string;

    @Column({ type: 'int' })
    capacity: number;

    @OneToMany(() => Booking, (booking) => booking.room)
    bookings?: Booking[];
}