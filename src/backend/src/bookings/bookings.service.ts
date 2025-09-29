import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository, Not, Between } from 'typeorm';
import { Booking } from './bookings.entity';

@Injectable()
export class BookingsService {
    constructor(
        @InjectRepository(Booking)
        private bookingsRepository: Repository<Booking>,
    ) {}

    /**
     * Creates a booking and adds it to the database.
     * 
     * @param userID - ID of the user creating the booking
     * @param roomID - ID of the room for the booking
     * @param startTime - Start time and date for the booking
     * @param endTime - End time and date for the booking
     * @returns The newly created booking if successful, conflict exception otherwise
     */
    async create(userID: number, roomID: number, startTime: Date, endTime: Date): Promise<Booking> {
        const overlap = await this.bookingsRepository.findOne({
            where: {
                room: { roomID },
                startTime: LessThan(endTime),
                endTime: MoreThan(startTime)
            }});
        if (overlap) {
            throw new ConflictException('Room is already booked for that time');
        }

        const booking = this.bookingsRepository.create({
            user: { userID },
            room: { roomID },
            startTime,
            endTime
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
        return await this.bookingsRepository.findOneBy({ bookingID });
    }

    /**
     * Finds all of a user's bookings.
     * 
     * @param userID - ID of the user to search bookings for
     * @returns List of the user's bookings
     */
    async findByUser(userID: number): Promise<Booking[]> {
        return await this.bookingsRepository.findBy({ user: { userID } });
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
            }});
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
            }});
    }

    /**
     * Finds all of a room's bookings.
     * 
     * @param roomID - ID of the room to search bookings for
     * @returns List of the room's bookings
     */
    async findByRoom(roomID: number): Promise<Booking[]> {
        return await this.bookingsRepository.findBy({ room: { roomID } });
    }

    /**
     * Finds all of the bookings on a given date.
     * 
     * @param date - Date to search bookings for
     * @returns List of the date's bookings
     */
    async findByDate(date: Date): Promise<Booking[]> {
        const start = new Date(date);
        start.setHours(0, 0, 0, 0);

        const end = new Date(date);
        end.setHours(23, 59, 59, 599);

        return await this.bookingsRepository.find({ where: { startTime: Between(start, end) } });
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
     * Updates the start/end time or room of a booking
     * 
     * @param bookingID - ID of the booking to update
     * @param newStartTime - New start time for the booking (optional)
     * @param newEndTime - New end time for the booking (optional)
     * @param newRoomID - New room ID for the booking (optional)
     * @returns The updated booking if successful, conflict exception otherwise
     */
    async update(bookingID: number, newStartTime?: Date, newEndTime?: Date, newRoomID?: number): Promise<Booking> {
        const booking = await this.findByID(bookingID);
        if (!booking) {
            throw new NotFoundException('Booking not found');
        }

        // Update the fields if they were input
        const startTime = newStartTime ?? booking.startTime;
        const endTime = newEndTime ?? booking.endTime;
        const roomID = newRoomID ?? booking.room.roomID;

        const overlap = await this.bookingsRepository.findOne({
            where: {
                room: { roomID },
                startTime: LessThan(endTime),
                endTime: MoreThan(startTime),
                bookingID: Not(bookingID)
            }});
        if (overlap) {
            throw new ConflictException('Room is already booked for that time');
        }

        if (newStartTime) {
            booking.startTime = newStartTime;
        }
        if (newEndTime) {
            booking.endTime = newEndTime;
        }
        if (newRoomID) {
            booking.room = { roomID: newRoomID } as any;
        }
        return this.bookingsRepository.save(booking);
    }

    /**
     * Deletes a booking from the database.
     * 
     * @param bookingID - ID of the booking to delete 
     * @returns - 1 if the booking was deleted, 0 otherwise
     */
    async delete(bookingID: number): Promise<boolean> {
        const res = await this.bookingsRepository.delete(bookingID);
        return (res.affected ?? 0) > 0; // Check if a booking was actually deleted
    }
}