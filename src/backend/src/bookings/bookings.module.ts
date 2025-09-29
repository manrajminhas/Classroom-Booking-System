import { Module } from "@nestjs/common";
import { BookingsController } from "./bookings.controller";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { TypeOrmModule } from "@nestjs/typeorm";

@Module({
    controllers: [BookingsController],
    providers: [BookingsService],
    imports: [TypeOrmModule.forFeature([Booking])]
})
export class BookingsModule {}