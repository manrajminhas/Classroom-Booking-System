import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException, ConflictException, BadRequestException, UseInterceptors, UploadedFile } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody, ApiParam } from "@nestjs/swagger";
import { FileInterceptor } from "@nestjs/platform-express";
import { LogsService } from "src/logs/logs.service";

@ApiTags('rooms')
@Controller('rooms')
export class RoomsController {
    constructor(
        private roomsService: RoomsService,
        private logsService: LogsService,
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
    @ApiResponse({ status: 400, description: 'Invalid room data' })
    @ApiResponse({ status: 409, description: 'The room already exists' })
    async create(@Body() room: Omit<Room, 'roomID'>): Promise<Room> {
        try {
            const created = await this.roomsService.create(room);

            await this.logsService.logAudit({
                actorId: 1,
                actorName: 'system',
                action: 'room.create',
                targetType: 'room',
                targetId: String(created.roomID),
                after: {
                    roomID: created.roomID,
                    building: created.building,
                    roomNumber: created.roomNumber,
                    capacity: created.capacity,
                    avEquipment: created.avEquipment,
                },
                details: `Created room ${created.building} ${created.roomNumber}`,
            });

            return created;
        }
        catch (error: any) {
            if (error.message?.includes('capacity') || error.message?.includes('Building and room number')) {
                throw new BadRequestException(error.message);
            }
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
        const before = await this.roomsService.findByLocation(building, roomNumber);
        if (!before) {
            throw new NotFoundException('Room not found');
        }

        const updated = await this.roomsService.update(before.roomID, newData);

        if (updated) {
            await this.logsService.logAudit({
                actorId: 1,
                actorName: 'system',
                action: 'room.update',
                targetType: 'room',
                targetId: String(before.roomID),
                before: {
                    roomID: before.roomID,
                    building: before.building,
                    roomNumber: before.roomNumber,
                    capacity: before.capacity,
                    avEquipment: before.avEquipment,
                },
                after: {
                    roomID: updated.roomID,
                    building: updated.building,
                    roomNumber: updated.roomNumber,
                    capacity: updated.capacity,
                    avEquipment: updated.avEquipment,
                },
                details: `Updated room ${building} ${roomNumber}`,
            });
        }

        return updated;
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
        const before = await this.roomsService.findByLocation(building, roomNumber);
        if (!before) {
            throw new NotFoundException('Room not found');
        }
        await this.roomsService.delete(before.roomID);

        await this.logsService.logAudit({
            actorId: 1,
            actorName: 'system',
            action: 'room.delete',
            targetType: 'room',
            targetId: String(before.roomID),
            before: {
                roomID: before.roomID,
                building: before.building,
                roomNumber: before.roomNumber,
                capacity: before.capacity,
                avEquipment: before.avEquipment,
            },
            details: `Deleted room ${building} ${roomNumber}`,
        });
    }

    @Post('upload')
    @ApiOperation({ summary: 'Add rooms from a CSV file' })
    @ApiResponse({ status: 201, description: 'The rooms have been added' })
    @ApiResponse({ status: 400, description: 'No file was uploaded' })
    @ApiResponse({ status: 404, description: 'No rooms to add were found'})
    @UseInterceptors(FileInterceptor('file'))
    async uploadCSV(@UploadedFile() file: Express.Multer.File, @Body('username') username?: string): Promise<Room[]> {
    if (!file) {
        throw new BadRequestException('No file uploaded');
    }

    const saved = await this.roomsService.addFromCSV(file);

    if (!saved || saved.length == 0) {
        throw new NotFoundException('No rooms were found in the file');
    }

    await this.logsService.logAudit({
        actorId: 1,
        actorName: username || 'unknown_user',
        action: 'room.importCsv',
        targetType: 'room',
        targetId: 'bulk',
        after: { count: saved.length },
        details: `Imported ${saved.length} rooms from CSV`,
    });

    return saved;
}
    
    @Delete()
    @ApiOperation({ summary: 'Delete all rooms from the database' })
    @ApiResponse({ status: 200, description: 'All rooms deleted successfully' })
    async deleteAll(): Promise<{ message: string }>{
        await this.roomsService.deleteAll();

        await this.logsService.logAudit({
            actorId: 1,
            actorName: 'system',
            action: 'room.deleteAll',
            targetType: 'room',
            targetId: 'all',
            details: 'Deleted all rooms',
        });

        return { message: 'All rooms deleted successfully' };
    }

}
