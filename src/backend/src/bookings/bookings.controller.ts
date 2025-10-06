import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException, ConflictException } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { UsersService } from "src/users/users.service";
import { RoomsService } from "src/rooms/rooms.service";
import { BadRequestException } from "@nestjs/common";
import { ParseIntPipe } from "@nestjs/common";

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
    constructor(
        private bookingsService: BookingsService,
        private usersService: UsersService,
        private roomsService: RoomsService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Find all bookings' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    async findAll(): Promise<Booking[]> {
        return await this.bookingsService.findAll();
    }

    @Post(':building/:roomNumber')
    @ApiResponse({ status: 200, description: 'Booking created', type: Booking })
    @ApiResponse({ status: 400, description: 'Attendees are greater than the capacity of the room' })
    @ApiResponse({ status: 404, description: 'Room not found' })
    @ApiParam({ name: 'building', description: 'Building in which to book a room' })
    @ApiParam({ name: 'roomNumber', description: 'Specific room to book' })
    @ApiBody({ description: 'Further information needed for the booking' })
    async create(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string,
        @Body('startTime') startTime: string,
        @Body('endTime') endTime: string,
        @Body('attendees') attendees: number
    ): Promise<Booking> {
        const userID: number = 1; // PLACEHOLDER!!!!

        const room = await this.roomsService.findByLocation(building, roomNumber);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return this.bookingsService.create(
            userID,
            room.roomID,
            new Date(startTime),
            new Date(endTime),
            Number(attendees)
        );
    }

    @Get('bookings/:username')
    @ApiOperation({ summary: "Find all of a user's bookings" })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'username', description: 'Username of the user to search' })
    async findByUser(@Param('username') username: string): Promise<Booking[]> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }

        const userID: number = user.userID;
        return await this.bookingsService.findByUser(userID);
    }

    @Delete()
    @ApiOperation({ summary: 'Delete all bookings' })
    @ApiResponse({ status: 200, description: 'All bookings deleted successfully' })
    async deleteAll(): Promise<{ message: string }> {
        await this.bookingsService.deleteAll();
        return { message: 'All bookings deleted successfully' };
    }

    @Delete(':bookingID')
    async deleteBooking(@Param('bookingID') bookingID: string): Promise<{ message: string }> {
        const id = Number(bookingID);

        const deleted = await this.bookingsService.delete(id);

        if (!deleted) {
            throw new NotFoundException('Booking not found');
        }

        return { message: 'Booking deleted successfully' };
    }

    @Get('date/:date')
    @ApiOperation({ summary: 'Find all bookings on a given date (UTC day)' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'date', description: 'ISO date (YYYY-MM-DD)' })
    async findByDate(@Param('date') dateStr: string): Promise<Booking[]> {
        // Accept YYYY-MM-DD or full ISO; normalize to Date
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) {
        throw new BadRequestException('Invalid date. Use YYYY-MM-DD or ISO string.');
        }
        return this.bookingsService.findByDate(d);
    }

    @Get('room/:roomID')
    @ApiOperation({ summary: 'Find all bookings for a specific room' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'roomID', description: 'Room ID' })
    async findByRoom(@Param('roomID', ParseIntPipe) roomID: number): Promise<Booking[]> {
        // Optional: validate room exists
        const room = await this.roomsService.findByID(roomID);
        if (!room) {
        throw new NotFoundException('Room not found');
        }
        return this.bookingsService.findByRoom(roomID);
    }

    @Get('user/:username/past')
    @ApiOperation({ summary: "Find a user's past bookings" })
    @ApiResponse({ status: 200, description: 'List of past bookings', type: [Booking] })
    @ApiParam({ name: 'username', description: 'Username' })
    async findPastForUser(@Param('username') username: string): Promise<Booking[]> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
        throw new NotFoundException('User not found');
        }
        return this.bookingsService.findPastForUser(user.userID);
    }

    @Get('user/:username/future')
        @ApiOperation({ summary: "Find a user's future bookings" })
        @ApiResponse({ status: 200, description: 'List of future bookings', type: [Booking] })
        @ApiParam({ name: 'username', description: 'Username' })
        async findFutureForUser(@Param('username') username: string): Promise<Booking[]> {
            const user = await this.usersService.findByUsername(username);
            if (!user) {
            throw new NotFoundException('User not found');
            }
            return this.bookingsService.findFutureForUser(user.userID);
        }


}