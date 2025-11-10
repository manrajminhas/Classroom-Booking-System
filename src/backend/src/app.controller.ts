import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

@Get()
@ApiOperation({ summary: 'Root endpoint', description: 'Returns a welcome message confirming the backend is running.' })
@ApiResponse({ status: 200, description: 'Backend running successfully.' })
getRoot() {
  return {
    message: 'Welcome to the backend API! Visit /docs/api for Swagger documentation.',
  };
}

@Get('health')
  @ApiOperation({
    summary: 'Check backend health status',
    description:
      'Returns the current uptime and timestamp to confirm the backend server is running correctly.',
  })
  @ApiResponse({
    status: 200,
    description: 'Health check successful. Server is running normally.',
    schema: {
      example: {
        status: 'ok',
        uptime: 123.456,
        timestamp: '2025-11-09T19:30:00.000Z',
      },
    },
  })
  getHealth() {
    return {
      status: 'ok',
      uptime: process.uptime(),
      timestamp: new Date(),
    };
  }
}