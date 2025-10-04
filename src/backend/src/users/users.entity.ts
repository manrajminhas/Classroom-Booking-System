import { Booking } from 'src/bookings/bookings.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

@Entity()
@Unique(['username'])
export class User {
    @PrimaryGeneratedColumn()
    userID: number;
    
    @Column({ type: 'varchar' })
    username: string;

    @Column({ type: 'varchar' })
    passwordHash: string;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];
}


export class PublicUser {
    userID: number;
    username: string;
}