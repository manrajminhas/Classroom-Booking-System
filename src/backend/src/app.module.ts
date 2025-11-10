import { Module, OnModuleInit } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { RoomsModule } from './rooms/rooms.module';
import { BookingsModule } from './bookings/bookings.module';
import { UsersModule } from './users/users.module';
import { LogsModule } from './logs/logs.module';
import { Room } from './rooms/rooms.entity';
import { Booking } from './bookings/bookings.entity';
import { User } from './users/users.entity';
import { Log } from './logs/logs.entity';
import { AuthModule } from './auth/auth.module';
import { UsersService } from './users/users.service'; // NEW: Import UsersService
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      entities: [Room, Booking, User, Log],
      synchronize: true,
    }),
    RoomsModule,
    BookingsModule,
    UsersModule,
    LogsModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
// Implement OnModuleInit
export class AppModule implements OnModuleInit {
  // Inject UsersService
  constructor(private readonly usersService: UsersService) {}

  async onModuleInit() {
    console.log('--- Ensuring TA Test Accounts Exist ---');
    
    const createTestUser = async (username: string, password: string, role: 'staff' | 'registrar' | 'admin') => {
      // The 'try' block attempts the user creation.
      try {
        await this.usersService.create(username, password, role);
        console.log(`Created test user: ${username} (${role})`);
      } 
      // The 'catch' block makes this operation safely repeatable
      // It handles the ConflictException thrown by usersService.create()
      // when the application starts up and the user already exists in the database
      catch (e) {
        // The empty catch ensures the server does not crash and the console remains clean 
        // without creating duplicate users. 
      }
    };
    
    // 1. Staff User (General Booking Access)
    await createTestUser('staff_user', 'password123', 'staff');
    
    // 2. Registrar User (Room Management Access)
    await createTestUser('registrar_ta', 'registrar123', 'registrar');
    
    // 3. Admin User (Audit Log and Health Check Access)
    await createTestUser('admin_ta', 'admin123', 'admin');

    console.log('--- Test Account Setup Complete ---');
  }
}