import { Booking } from 'src/bookings/bookings.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

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

    @OneToMany(() => Booking, (booking) => booking.room)
    bookings: Booking[];
}