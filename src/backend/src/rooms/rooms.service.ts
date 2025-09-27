import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Room } from './rooms.entity';

@Injectable()
export class RoomsService {

    constructor(
        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,
    ) {}

    /**
     * Creates a room and adds it to the database.
     * 
     * @param roomData - Room object containing details of the room to create.
     * @returns The new room entity with all of its fields.
     */
    async create(roomData: Room): Promise<Room> {
        const room = this.roomsRepository.create(roomData);
        return this.roomsRepository.save(room); // Add the room to the database
    } 

    /**
     * Finds all rooms in the database.
     * 
     * @returns An array containing all rooms in the database.
     */
    async findAll(): Promise<Room[]> {
        return this.roomsRepository.find();
    }

    /**
     * Finds a room matching the given criteria.
     * 
     * @param room - Room object containing at least the building and room number
     * @returns The corresponding room if found, otherwise null
     */
    async findOne(room: Room): Promise<Room | null> {
        return this.roomsRepository.findOneBy(
            {building: room.building, roomNumber: room.roomNumber}
        );
    }

    /**
     * Updates a room based on new info given.
     * @param room - Room object that needs to be updated. 
     * @param newData - The new information to put in the room object.
     * @returns - The updated room if it exists, otherwise null
     */
    async update(room: Room, newData: Partial<Room>): Promise<Room | null> {
        await this.roomsRepository.update(room, newData);
        return this.roomsRepository.findOneBy(room);
    }

    /**
     * 
     * @param room - Room object to be deleted
     */
    async delete(room: Room): Promise<void> {
        await this.roomsRepository.delete(room);
    }
}