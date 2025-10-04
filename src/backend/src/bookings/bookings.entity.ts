import { Room } from 'src/rooms/rooms.entity';
import { User } from 'src/users/users.entity';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, Unique } from 'typeorm';

@Entity()
export class Booking {
    @PrimaryGeneratedColumn()
    bookingID: number;

    @ManyToOne(() => User, (user) => user.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'userID' })
    user: User;

    @ManyToOne(() => Room, (room) => room.bookings, { onDelete: 'CASCADE' })
    @JoinColumn({ name: 'roomID' })
    room: Room;

    @Column({ type: 'datetime' })
    startTime: Date;

    @Column({ type: 'datetime' })
    endTime: Date;

    @Column({ type: 'int' })
    attendees: number;
}