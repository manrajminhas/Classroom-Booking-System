import { Entity, Column, PrimaryGeneratedColumn, Unique } from 'typeorm';

@Entity()
@Unique(['username'])
export class User {
    @PrimaryGeneratedColumn()
    userID: number;
    
    @Column()
    username: string;

    @Column()
    passwordHash: string;
}

export class PublicUser {
    userID: number;
    username: string;
}