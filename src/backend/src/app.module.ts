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


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: 'localhost',
      port: 5432,
      username: 'admin',
      password: '',
      database: 'room_booking',
      entities: [Room, Booking, User],
      synchronize: true
    }),
    RoomsModule, BookingsModule, UsersModule, LogsModule], 
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
