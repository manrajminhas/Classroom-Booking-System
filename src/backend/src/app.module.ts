import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { Room } from './rooms/rooms.entity';
import { Booking } from './bookings/bookings.entity';
import { User } from './users/users.entity';
import { LogsModule } from './logs/logs.module';
import * as dotenv from 'dotenv';
dotenv.config();


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST,
      port: Number(process.env.DB_PORT),
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      entities: [Room, Booking, User],
      synchronize: true,
    }),
    RoomsModule, BookingsModule, UsersModule, LogsModule], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
