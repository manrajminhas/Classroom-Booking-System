
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { DataSource } from 'typeorm';
import { Room } from './rooms/rooms.entity';

async function seedRooms(dataSource: DataSource) {
    const roomRepo = dataSource.getRepository(Room);

    const count = await roomRepo.count();
    if (count === 0) {
        await roomRepo.save([
            { roomNumber: '101', building: 'ECS', capacity: 50 },
            { roomNumber: '102', building: 'ECS', capacity: 30 },
            { roomNumber: '201', building: 'BWC', capacity: 20 },
        ]);
    }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();
  const dataSource = app.get(DataSource);

  await seedRooms(dataSource);

  const config =  new DocumentBuilder()
    .setTitle('Room Booking API')
    .setDescription('API documentation for our TS & NestJS room booking project')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
