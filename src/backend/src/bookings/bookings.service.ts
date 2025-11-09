import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
// UPDATED IMPORTS: Added In, FindOptionsWhere, and MoreThanOrEqual for availability search
import { LessThan, MoreThan, Repository, Not, Between, In, FindOptionsWhere, MoreThanOrEqual } from 'typeorm'; 
import { Booking } from './bookings.entity';
import { Room } from 'src/rooms/rooms.entity';

@Injectable()
export class BookingsService {

    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,

        @InjectRepository(Room)
        private roomsRepository: Repository<Room>
    ) {}

    /**
     * Creates a booking and adds it to the database.
     * * @param userID - ID of the user creating the booking
     * @param roomID - ID of the room for the booking
     * @param startTime - Start time and date for the booking
     * @param endTime - End time and date for the booking
     * @param attendees - Number of attendees expected
     * @returns The newly created booking if successful
     */

    
    async create(userID: number, roomID: number, startTime: Date, endTime: Date, attendees: number): Promise<Booking> {
        console.log(" Received booking request:");
        console.log("  startTime =", startTime);
        console.log("  endTime   =", endTime);
        console.log("  now       =", new Date());

        const toLocal = (d: Date) => new Date(d.getTime() - d.getTimezoneOffset() * 60000);
        const localStart = toLocal(new Date(startTime));
        const localEnd = toLocal(new Date(endTime));
        const localNow = toLocal(new Date());

        console.log(" Adjusted times (local check):");
        console.log("  localStart =", localStart);
        console.log("  localEnd   =", localEnd);
        console.log("  localNow   =", localNow);

        if (localStart > localEnd || localStart.getTime() < localNow.getTime()) {
            throw new BadRequestException('Invalid time entered');
        }

        const overlap = await this.bookingsRepository.findOne({
            where: {
                room: { roomID },
                startTime: LessThan(endTime),
                endTime: MoreThan(startTime)
            }});
        if (overlap) {
            throw new ConflictException('Room is already booked for that time');
        }

        const room = await this.roomsRepository.findOneBy({ roomID });
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        if (attendees > room.capacity) {
            throw new BadRequestException(`Room capacity is ${room.capacity}. You have ${attendees} attendees.`);
        }
        else if (attendees < 1) {
            throw new BadRequestException('You need at least 1 attendee');
        }

        const booking = this.bookingsRepository.create({
            user: { userID },
            room: { roomID },
            startTime,
            endTime,
            attendees
        });
        return this.bookingsRepository.save(booking);
    }
    
    // 
    // Method to find rooms available for a specific time slot
    // 

    /**
     * Finds all rooms available during a specific time slot, optionally filtering by capacity.
     * * @param startTime - Start time and date for the availability check
     * @param endTime - End time and date for the availability check
     * @param minCapacity - Minimum required room capacity (optional)
     * @returns List of available rooms
     */
    async findAvailableRooms(startTime: Date, endTime: Date, minCapacity?: number): Promise<Room[]> {
        // 1. Find the IDs of rooms that are currently booked (overlap)
        const conflictingBookings = await this.bookingsRepository.find({
            select: { room: { roomID: true } }, // Select only the room ID
            relations: { room: true },
            where: {
                startTime: LessThan(endTime),
                endTime: MoreThan(startTime)
            },
        });

        // 2. Extract unique occupied room IDs
        const occupiedRoomIDs = conflictingBookings
            .map(b => b.room.roomID)
            .filter((id, index, self) => self.indexOf(id) === index); // Unique IDs

        // 3. Prepare Room search conditions
        const roomWhere: FindOptionsWhere<Room> = {
            // Filter out all occupied rooms
            roomID: occupiedRoomIDs.length > 0 ? Not(In(occupiedRoomIDs)) : undefined
        };

        // Add capacity filter if provided
        if (minCapacity !== undefined && minCapacity > 0) {
            roomWhere.capacity = MoreThanOrEqual(minCapacity);
        }
        
        // 4. Find all rooms that meet criteria and are NOT occupied
        return this.roomsRepository.find({
            where: roomWhere,
            order: { building: 'ASC', roomNumber: 'ASC' }
        });
    }

    // 
    // 
    //


    /**
     * Finds a booking given its ID.
     * * @param bookingID - ID of the booking to find
     * @returns - The corresponding booking if found, null otherwise
     */
    async findByID(bookingID: number): Promise<Booking | null> {
        return await this.bookingsRepository.findOne({
            where: { bookingID },
            relations: ['room', 'user']
        });
    }

    /**
     * Finds all of a user's bookings.
     * * @param userID - ID of the user to search bookings for
     * @returns List of the user's bookings
     */
    async findByUser(userID: number): Promise<Booking[]> {
        return await this.bookingsRepository.find({
            where: { user: { userID } },
            relations: ['room', 'user']
        });
    }

    /**
     * Finds all of a user's future bookings.
     * * @param userID - ID of the user to search future bookings for
     * @returns List of the user's future bookings
     */
    async findFutureForUser(userID: number): Promise<Booking[]> {
        const now = new Date();
        return await this.bookingsRepository.find({
            where: {
                user: { userID },
                startTime: MoreThan(now)
            },
            relations: ['user', 'room']
        });
    }

    /**
     * Finds all of a user's past bookings.
     * * @param userID - ID of the user to search past bookings for
     * @returns List of the user's past bookings
     */
    async findPastForUser(userID: number): Promise<Booking[]> {
        const now = new Date();
        return await this.bookingsRepository.find({
            where: {
                user: { userID },
                startTime: LessThan(now)
            },
            relations: ['user', 'room']
        });
    }

    /**
     * Finds all of a room's bookings.
     * * @param roomID - ID of the room to search bookings for
     * @returns List of the room's bookings
     */
    async findByRoom(roomID: number): Promise<Booking[]> {
        return await this.bookingsRepository.find({
            where: {
                room: { roomID }
            },
            relations: ['user', 'room']
        });
    }

    /**
     * Finds all of the bookings on a given date.
     * * @param date - Date to search bookings for
     * @returns List of the date's bookings
     */
    async findByDate(date: Date): Promise<Booking[]> {
        const start = new Date(date);
        start.setUTCHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setUTCHours(23, 59, 59, 999);

        return await this.bookingsRepository.find({
            where: {
                startTime: Between(start, end)
            },
            relations: ['user', 'room']
        });
    }

    /**
     * Finds all bookings in the database.
     * * @returns List of all bookings
     */
    async findAll(): Promise<Booking[]> {
        return await this.bookingsRepository.find({
        relations: ['room', 'user'],
        order: { startTime: 'ASC' },
        });
    }

    /**
     * Deletes a booking from the database.
     * * @param bookingID - ID of the booking to delete 
     * @returns - true if the booking was deleted, false otherwise
     */
    async delete(bookingID: number): Promise<boolean> {
        const res = await this.bookingsRepository.delete(bookingID);
        return (res.affected ?? 0) > 0; // Check if a booking was actually deleted
    }

    /**
     * Deletes all bookings from the database (admin use only).
     */
    async deleteAll(): Promise<void> {
        await this.bookingsRepository.clear();
    }
}