import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException, ConflictException } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { UsersService } from "src/users/users.service";

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
    constructor(
        private bookingsService: BookingsService,
        private usersService: UsersService
    ) {}

    @Get()
    @ApiOperation({ summary: 'Find all bookings' })
    @ApiResponse({ status: 200, description: 'List of bookings', type: [Booking] })
    async findAll(): Promise<Booking[]> {
        return await this.bookingsService.findAll();
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

}