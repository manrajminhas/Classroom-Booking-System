import { Booking } from 'src/bookings/bookings.entity';
import { Entity, Column, PrimaryGeneratedColumn, Unique, OneToMany } from 'typeorm';

@Entity()
@Unique(['username'])
export class User {
    @PrimaryGeneratedColumn()
    userID: number;
    
    @Column()
    username: string;

    @Column()
    passwordHash: string;

    @OneToMany(() => Booking, (booking) => booking.user)
    bookings: Booking[];
}

export class PublicUser {
    userID: number;
    username: string;
}