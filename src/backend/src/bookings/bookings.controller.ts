import { Controller, Body, Get, Post, Delete, Param, NotFoundException, BadRequestException, ParseIntPipe, Query } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { Room } from "src/rooms/rooms.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiParam, ApiQuery } from "@nestjs/swagger";
import { UsersService } from "src/users/users.service";
import { RoomsService } from "src/rooms/rooms.service";
import { LogsService } from "src/logs/logs.service";

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
    constructor(
        private bookingsService: BookingsService,
        private usersService: UsersService,
        private roomsService: RoomsService,
        private logsService: LogsService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Find all bookings' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    async findAll(): Promise<Booking[]> {
        return await this.bookingsService.findAll();
    }

    @Get('available')
    @ApiOperation({ summary: 'Find all rooms available during a specific date and time slot' })
    @ApiResponse({ 
        status: 200, 
        description: 'List of available rooms', 
        type: Room,
        isArray: true
    })
    @ApiQuery({ name: 'start', description: 'ISO date string for start time', required: true })
    @ApiQuery({ name: 'end', description: 'ISO date string for end time', required: true })
    @ApiQuery({ name: 'capacity', description: 'Minimum capacity filter (optional)', required: false, type: 'number' })
    async findAvailableRooms(
        @Query('start') startStr: string,
        @Query('end') endStr: string,
        @Query('capacity') capacityStr?: string,
    ): Promise<any> {
        const startTime = new Date(startStr);
        const endTime = new Date(endStr);
        // Safely parse capacity; defaults to undefined if not provided or invalid
        const minCapacity = capacityStr ? parseInt(capacityStr, 10) : undefined;

        if (isNaN(startTime.getTime()) || isNaN(endTime.getTime())) {
            throw new BadRequestException('Invalid start or end time format.');
        }
        if (startTime >= endTime) {
            throw new BadRequestException('Start time must be before end time.');
        }

        return this.bookingsService.findAvailableRooms(startTime, endTime, minCapacity);
    }

    @Post(':building/:roomNumber')
    @ApiOperation({summary: 'Create a new booking for a specific room'})
    @ApiResponse({ status: 200, description: 'Booking created', type: Booking })
    @ApiResponse({ status: 400, description: 'Attendees exceed room capacity' })
    @ApiResponse({ status: 404, description: 'Room not found' })
    @ApiParam({ name: 'building', description: 'Building of the room' })
    @ApiParam({ name: 'roomNumber', description: 'Room number' })
    @ApiBody({ description: 'Booking details' })
    async create(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string,
        @Body('startTime') startTime: string,
        @Body('endTime') endTime: string,
        @Body('attendees') attendees: number,
        @Body('username') username: string
    ): Promise<Booking> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException(`User not found: ${username}`);
        }

        const room = await this.roomsService.findByLocation(building, roomNumber);
        if (!room) {
            throw new NotFoundException(`Room not found: ${building} ${roomNumber}`);
        }

        const created = await this.bookingsService.create(
            user.userID,
            room.roomID,
            new Date(startTime),
            new Date(endTime),
            Number(attendees)
        );

        await this.logsService.logAudit({
            actorId: user.userID,
            actorName: user.username,
            action: 'booking.create',
            targetType: 'booking',
            targetId: String(created.bookingID),
            before: {},
            after: {
                bookingID: created.bookingID,
                roomID: created.room.roomID,
                startTime: created.startTime,
                endTime: created.endTime,
                attendees: created.attendees,
            },
            details: `Created booking for ${building} ${roomNumber}`,
        });

        return created;
    }

    @Get('bookings/:username')
    @ApiOperation({ summary: "Find all bookings for a user" })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'username', description: 'Username' })
    async findByUser(@Param('username') username: string): Promise<Booking[]> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return await this.bookingsService.findByUser(user.userID);
    }

    @Delete()
    @ApiOperation({ summary: 'Delete all bookings' })
    @ApiResponse({ status: 200, description: 'All bookings deleted' })
    async deleteAll(): Promise<{ message: string }> {
        await this.bookingsService.deleteAll();
        await this.logsService.logAudit({
            actorId: 1,
            actorName: 'system',
            action: 'booking.deleteAll',
            targetType: 'booking',
            targetId: 'all',
            before: {},
            after: {},
            details: 'Deleted all bookings',
        });
        return { message: 'All bookings deleted successfully' };
    }

    @Delete(':bookingID')
    @ApiOperation({ summary: 'Delete a specific booking' })
    @ApiResponse({ status: 200, description: 'Booking deleted successfully' })
    @ApiResponse({ status: 404, description: 'Booking not found' })
    @ApiBody({ description: 'Optional username of the actor performing the deletion' })
    async deleteBooking(
        @Param('bookingID') bookingID: string,
        @Body('username') username?: string
    ): Promise<{ message: string }> {
        const id = Number(bookingID);
        const deleted = await this.bookingsService.delete(id);

        if (!deleted) {
            throw new NotFoundException('Booking not found');
        }

        let actorName = 'system';
        let actorId = 1;
        if (username) {
            const user = await this.usersService.findByUsername(username);
            if (user) {
            actorName = user.username;
            actorId = user.userID;
            } else if (username === 'registrar') {
            actorName = 'registrar';
            actorId = 0;
            }
        }

        await this.logsService.logAudit({
            actorId,
            actorName,
            action: 'booking.delete',
            targetType: 'booking',
            targetId: String(id),
            before: {},
            after: {},
            details: `Deleted booking ${id}`,
        });

        return { message: 'Booking deleted successfully' };
    }

    @Get('date/:date')
    @ApiOperation({ summary: 'Find bookings by date (UTC day)' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'date', description: 'ISO date (YYYY-MM-DD)' })
    async findByDate(@Param('date') dateStr: string): Promise<Booking[]> {
        const d = new Date(dateStr);
        if (Number.isNaN(d.getTime())) {
            throw new BadRequestException('Invalid date. Use YYYY-MM-DD or ISO format.');
        }
        return this.bookingsService.findByDate(d);
    }

    @Get('room/:roomID')
    @ApiOperation({ summary: 'Find bookings for a room' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    @ApiParam({ name: 'roomID', description: 'Room ID' })
    async findByRoom(@Param('roomID', ParseIntPipe) roomID: number): Promise<Booking[]> {
        const room = await this.roomsService.findByID(roomID);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return this.bookingsService.findByRoom(roomID);
    }

    @Get('user/:username/past')
    @ApiOperation({ summary: "Find a user's past bookings" })
    @ApiResponse({ status: 200, description: 'List of past bookings', type: [Booking] })
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
    async findFutureForUser(@Param('username') username: string): Promise<Booking[]> {
        const user = await this.usersService.findByUsername(username);
        if (!user) {
            throw new NotFoundException('User not found');
        }
        return this.bookingsService.findFutureForUser(user.userID);
    }
}