import { Module } from "@nestjs/common";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "src/users/users.module";
import { RoomsModule } from "src/rooms/rooms.module";
import { Room } from "src/rooms/rooms.entity";
import { LogsModule } from "src/logs/logs.module";

@Module({
    controllers: [BookingsController],
    providers: [BookingsService],
    imports: [TypeOrmModule.forFeature([Booking, Room]), RoomsModule, UsersModule, LogsModule]
})
export class BookingsModule {}