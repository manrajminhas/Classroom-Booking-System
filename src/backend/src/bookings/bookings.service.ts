import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository, Not, Between } from 'typeorm';
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
     * 
     * @param userID - ID of the user creating the booking
     * @param roomID - ID of the room for the booking
     * @param startTime - Start time and date for the booking
     * @param endTime - End time and date for the booking
     * @param attendees - Number of attendees expected
     * @returns The newly created booking if successful
     */
    async create(userID: number, roomID: number, startTime: Date, endTime: Date, attendees: number): Promise<Booking> {
        if (startTime > endTime || startTime.getTime() < Date.now()) {
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

    /**
     * Finds a booking given its ID.
     * 
     * @param bookingID - ID of the booking to find
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
     * 
     * @param userID - ID of the user to search bookings for
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
     * 
     * @param userID - ID of the user to search future bookings for
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
     * 
     * @param userID - ID of the user to search past bookings for
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
     * 
     * @param roomID - ID of the room to search bookings for
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
     * 
     * @param date - Date to search bookings for
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
     * 
     * @returns List of all bookings
     */

    async findAll(): Promise<Booking[]> {
        return await this.bookingsRepository.find();
    }

    /**
     * Deletes a booking from the database.
     * 
     * @param bookingID - ID of the booking to delete 
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