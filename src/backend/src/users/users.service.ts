import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './users.entity';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private usersRepository: Repository<User>,
    ) {}

    /**
     * Finds all users.
     * 
     * @returns All users in the database
     */
    async findAll(): Promise<User[]> {
        return await this.usersRepository.find();
    } 

    /** Finds a user with a matching username.
     * 
     * @param username - The username of the user to find
     * @returns The corresponding user if found, otherwise null
     */
    async findByUsername(username: string): Promise<User | null> {
        return await this.usersRepository.findOneBy({ username });
    }

    /**
     * Finds a user with a matching userID.
     * 
     * @param userID - The ID of the user to find
     * @returns The corresponding user if found, otherwise null
     */
    async findByID(userID: number): Promise<User | null> {
        return await this.usersRepository.findOneBy({ userID });
    }

    /**
     * Creates a user given username and password.
     * 
     * @param username - Username of the user to create
     * @param password - Plaintext password of the user to create
     * @param role - Role of the user to create
     * @returns The newly created user object
     */
    async create(username: string, password: string, role: 'staff' | 'registrar' | 'admin' = 'staff') {
        const existing = await this.usersRepository.findOne({ where: { username } });
        if (existing) {
            throw new ConflictException('User already exists');
        }

        const passwordHash = await bcrypt.hash(password, 10);
        const newUser = this.usersRepository.create({
            username,
            passwordHash,
            role,
        });

        return this.usersRepository.save(newUser);
        }

    /**
     * Validates a user's login credentials.
     * 
     * @param username - Username of the user to validate
     * @param password - Plaintext password of the user to validate
     * @returns The corresponding user if the username and password match, null otherwise
     */
    async validate(username: string, password: string): Promise<User | null> {
        const user = await this.findByUsername(username);
        if (user && await bcrypt.compare(password, user.passwordHash)) {
            return user;
        }
        return null;
    }

    /**
     * Deletes a user.
     * 
     * @param userID - ID of the user to delete
     * @returns True if delete was successful, false otherwise
     */
    async delete(userID: number): Promise<boolean> {
        const res = await this.usersRepository.delete(userID);
        return (res.affected ?? 0) > 0;
    }    
}