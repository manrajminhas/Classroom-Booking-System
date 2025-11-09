import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MoreThanOrEqual, Repository } from 'typeorm';
import { Room } from './rooms.entity';  
import { Readable } from 'stream';
import csv from 'csv-parser';
import fs from 'fs';

@Injectable()
export class RoomsService {
    constructor(
        @InjectRepository(Room)
        private roomsRepository: Repository<Room>,
    ) {}

    /**
     * Creates a room and adds it to the database.
     * 
     * @param roomData - Room object containing details of the room to create
     * @returns The new room entity with all of its fields, including roomID
     */
    async create(roomData: Omit<Room, 'roomID'>): Promise<Room> {
        if (roomData.capacity <= 0 || !Number.isInteger(roomData.capacity)) {
            throw new Error('Room capacity must be a positive integer');
        }

        if (roomData.building == '' || roomData.roomNumber == '') {
            throw new Error('Building and room number are required');
        }
        const room = this.roomsRepository.create(roomData);
        return await this.roomsRepository.save(room); // Add room to the DB
    } 

    /**
     * Finds all rooms in the database.
     * 
     * @returns An array containing all rooms in the database
     */
    async findAll(): Promise<Room[]> {
        return this.roomsRepository.find();
    }

    /**
     * Finds a room matching the given building and room number.
     * 
     * @param building - The building containing the room
     * @param roomNumber - The room number within the building
     * @returns The corresponding room if found, otherwise null
     */
    async findByLocation(building: string, roomNumber: string): Promise<Room | null> {
        return this.roomsRepository.findOneBy({ building, roomNumber });
    }

    /**
     * Finds all rooms in the given building.
     * 
     * @param building - The building to search
     * @returns An array of rooms in the building
     */
    async findByBuilding(building: string): Promise<Room[]> {
        return this.roomsRepository.find({
            where: { building: building },
            order: { roomNumber: 'ASC' }
        });
    }

    /**
     * Finds all rooms with capacity greater than or equal to the given value.
     * 
     * @param capacity - The minimum desired room capacity
     * @returns An array of matching rooms
     */
    async findByCapacity(capacity: number): Promise<Room[]> {
        if (capacity <= 0 || !Number.isInteger(capacity)) {
            throw new BadRequestException('Room capacity must be a positive integer');
        }
        return this.roomsRepository.find({ 
            where: { capacity: MoreThanOrEqual(capacity) },
            order: { capacity: 'ASC' }
        });
    }

    /**
     * Finds a room matching the given ID.
     * 
     * @param roomID - The ID of the room to find
     * @returns The corresponding room if found, otherwise null
     */
    async findByID(roomID: number): Promise<Room | null> {
        return this.roomsRepository.findOneBy({ roomID });
    }

    /**
     * Updates a room based on new info given.
     * 
     * @param roomID - ID of the room to be updated
     * @param newData - The new information to put in the room object (excluding roomID)
     * @returns The updated room if it exists, otherwise null
     */
    async update(roomID: number, newData: Omit<Partial<Room>, 'roomID'>): Promise<Room | null> {
        if (Object.keys(newData).length == 0) { // Do nothing when no arguments passed in
            return await this.roomsRepository.findOneBy({ roomID });
        }
        
        if (newData.capacity !== undefined) {
            if (newData.capacity <= 0 || !Number.isInteger(newData.capacity)) {
                throw new BadRequestException('Room capacity must be a positive integer');
            }
        }
        
        await this.roomsRepository.update(roomID, newData);

        return this.roomsRepository.findOneBy ({ roomID });
    }

    /**
     * Deletes a room given room ID.
     * 
     * @param roomID - ID of the room to delete
     * @returns true if the room was deleted, false otherwise
     */
    async delete(roomID: number): Promise<boolean> {
        const res = await this.roomsRepository.delete(roomID);
        return (res.affected ?? 0) > 0; // Check if a room was actually deleted
    }

    /**
     * Adds rooms to the database given a CSV containing room data.
     * 
     * @param file - CSV containing room data 
     * @returns The newly saved rooms
     */
    async addFromCSV(file: Express.Multer.File | string): Promise<Room[]> {
        const results: Partial<Room>[] = [];
        const stream = 
                typeof file === 'string'
                    ? fs.createReadStream(file)
                    : Readable.from(file.buffer.toString());

        await new Promise<void>((resolve, reject) => {
            stream.pipe(csv())
                .on('data', (data) => {
                    const roomStr = data['Room'];

                    // Split the field and remove any empty spaces
                    if (!roomStr) return;
                    const roomParts = roomStr.split(' ').filter(Boolean);
                    
                    results.push({
                        building: roomParts[0],
                        roomNumber: roomParts[1],
                        capacity: parseInt(data['Capacity'], 10),
                        avEquipment: data['AV Equipment']
                    });
                })
                .on('end', () => resolve())
                .on('error', (err) => reject(err));
        });

        const saved = await this.roomsRepository.save(results);
        return saved;
    }

    /**
     * Deletes all rooms from the database (admin use only).
     */
    async deleteAll() {
        await this.roomsRepository.clear();
    }
}