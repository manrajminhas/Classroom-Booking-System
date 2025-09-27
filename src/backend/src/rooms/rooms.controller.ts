import { Controller, Body, Get, Post, Put, Delete, Param } from "@nestjs/common";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.entity";

@Controller('rooms')
export class RoomsController {
    constructor(
        private roomsService: RoomsService,
    ) {}

    @Get()
    findAll(): Promise<Room[]> {
        return this.roomsService.findAll();
    }

    @Get(':building/:roomNumber')
    findOne(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<Room | null> {
        const room: Room = { building, roomNumber } as Room;
        return this.roomsService.findOne(room);
    }

    @Post()
    create(@Body() room: Room): Promise<Room> {
        return this.roomsService.create(room);
    }

    @Put(':building/:roomNumber')
    update(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string,
        @Body() newData: Partial<Room>
    ): Promise<Room | null> {
        const room: Room = { building, roomNumber } as Room;
        return this.roomsService.update(room, newData);
    }

    @Delete(':building/:roomNumber')
    delete(
        @Param('building') building: string,
        @Param('roomNumber') roomNumber: string
    ): Promise<void> {
        const room: Room = { building, roomNumber } as Room;
        return this.roomsService.delete(room);
    }

}