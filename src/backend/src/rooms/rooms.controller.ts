import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException, ConflictException } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
    constructor(
        private roomsService: RoomsService,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Find all rooms' })
    @ApiResponse({ status: 200, description: 'List of rooms', type: [Room] })
    findAll(): Promise<Room[]> {
        return this.roomsService.findAll();
    }

    @Get(':building/:roomNumber')
    @ApiOperation({ summary: 'Find a room given building/room number' })
    @ApiResponse({ status: 200, description: 'Matching room', type: Room })
    @ApiResponse({ status: 404, description: 'Room not found' })
    @ApiParam({ name: 'building', description: 'Name of the building to search' })
    @ApiParam({ name: 'roomNumber', description: 'Room number to find' })
    async findByLocation(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<Room | null> {
        const room = await this.roomsService.findByLocation(building, roomNumber);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return room;
    }

    @Get('building/:building')
    @ApiOperation({ summary: 'Find rooms in the given building' })
    @ApiResponse({ status: 200, description: 'Matching rooms', type: [Room] })
    @ApiParam({ name: 'building', description: 'Name of the building to search' })
    async findByBuilding(@Param('building') building: string): Promise<Room[]> {
        return await this.roomsService.findByBuilding(building);
    } 

    @Get('capacity/:capacity')
    @ApiOperation({ summary: 'Find rooms with capacity >= given value' })
    @ApiResponse({ status: 200, description: 'Matching rooms', type: [Room] })
    @ApiParam({ name: 'capacity', description: 'Minimum capacity of rooms to search' })
    async findByCapacity(@Param('capacity') capacity: string): Promise<Room[]> {
        return await this.roomsService.findByCapacity(Number(capacity));
    }

    @Post()
    @ApiOperation({ summary: 'Create a room' })
    @ApiBody({ description: 'Fields to input', type: Room })
    @ApiResponse({ status: 201, description: 'The room has been added', type: Room })
    @ApiResponse({ status: 409, description: 'The room already exists' })
    async create(@Body() room: Omit<Room, 'roomID'>): Promise<Room> {
        try {
            return await this.roomsService.create(room);
        }
        catch (error) {
            throw new ConflictException('Room already exists');
        }
    }
    
    @Put(':building/:roomNumber')
    @ApiOperation({ summary: 'Update a room given building and room number' })
    @ApiBody({ description: 'Fields to update', type: Room })
    @ApiResponse({ status: 200, description: 'Room updated', type: Room })
    @ApiResponse({ status: 404, description: 'Room not found' })
    @ApiParam({ name: 'building', description: 'Building containing the room to update' })
    @ApiParam({ name: 'roomNumber', description: 'Number of the room to update' })
    async update(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string,
        @Body() newData: Omit<Partial<Room>, 'roomID'>
    ): Promise<Room | null> {
        const room = await this.roomsService.findByLocation(building, roomNumber);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        return await this.roomsService.update(room.roomID, newData);
    }

    @Delete(':building/:roomNumber')
    @ApiOperation({ summary: 'Delete a room given building and room number' })
    @ApiResponse({ status: 204, description: 'Room deleted' })
    @ApiResponse({ status: 404, description: 'Room not found' })  
    @ApiParam({ name: 'building', description: 'Building containing the room to delete' })
    @ApiParam({ name: 'roomNumber', description: 'Number of the room to delete' })  
    async delete(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<void> {
        const room = await this.roomsService.findByLocation(building, roomNumber);
        if (!room) {
            throw new NotFoundException('Room not found');
        }
        await this.roomsService.delete(room.roomID);
    }

}