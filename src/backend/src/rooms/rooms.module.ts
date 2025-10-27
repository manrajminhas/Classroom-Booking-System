import { Module } from "@nestjs/common";
import { RoomsController } from "./rooms.controller";
import { RoomsService } from "./rooms.service";
import { Room } from "./rooms.entity";
import { TypeOrmModule } from "@nestjs/typeorm";
import { LogsModule } from "src/logs/logs.module";

@Module({
    controllers: [RoomsController],
    providers: [RoomsService],
    imports: [TypeOrmModule.forFeature([Room]), LogsModule], 
    exports: [RoomsService]
})
export class RoomsModule {}