import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Room } from './rooms/rooms.entity';
import { RoomsService } from "./rooms/rooms.service";

async function seedRooms(dataSource: DataSource) {
  const roomRepo = dataSource.getRepository(Room);

  const csvPath = path.join(__dirname, '..', 'data', 'uvic_rooms.csv');
  if (!fs.existsSync(csvPath)) {
    console.warn('CSV file not found at', csvPath);
    return;
  }

  console.log('Loading rooms from CSV...');

  const roomsService = new RoomsService(roomRepo);
  const savedRooms = await roomsService.addFromCSV(csvPath);

  console.log(`Reloaded ${savedRooms.length} rooms from CSV`);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  const dataSource = app.get(DataSource);

  await seedRooms(dataSource);

  const config = new DocumentBuilder()
    .setTitle('Room Booking API')
    .setDescription('API documentation for the UVic Room Booking System')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}

bootstrap();