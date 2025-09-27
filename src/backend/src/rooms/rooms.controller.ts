import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";

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
    @ApiResponse( { status: 200, description: 'Matching room', type: Room })
    @ApiResponse( {status: 404, description: 'Room not found' })
    async findOne(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<Room | null> {
        const room: Room = { building, roomNumber } as Room;
        const found = await this.roomsService.findOne(room);
        if (!found) {
            throw new NotFoundException('Room not found');
        }
        return found;
    }

    @Post()
    @ApiOperation({ summary: 'Create a room' })
    @ApiResponse({ status: 201, description: 'The room has been added', type: Room })
    create(@Body() room: Room): Promise<Room> {
        return this.roomsService.create(room);
    }
    
    @Put(':building/:roomNumber')
    @ApiOperation({ summary: 'Update a room given building/room number' })
    @ApiBody({ description: 'Fields to update', type: Room })
    @ApiResponse({ status: 200, description: 'Room updated', type: Room })
    @ApiResponse({ status: 404, description: 'Room not found' })
    async update(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string,
        @Body() newData: Partial<Room>
    ): Promise<Room | null> {
        const room: Room = { building, roomNumber } as Room;
        const updated = await this.roomsService.update(room, newData);
        if (!updated) {
            throw new NotFoundException('Room not found');
        }
        return updated;
    }

    @Delete(':building/:roomNumber')
    @ApiOperation({ summary: 'Delete a room given building/room number' })
    @ApiResponse({ status: 204, description: 'Room deleted' })
    @ApiResponse({ status: 404, description: 'Room not found' })    
    async delete(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<void> {
        const room: Room = { building, roomNumber } as Room;
        const deleted = await this.roomsService.delete(room);
        if (!deleted) {
            throw new NotFoundException('Room not found');
        }
    }

}