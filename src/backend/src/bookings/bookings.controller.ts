import { Controller, Body, Get, Post, Put, Delete, Param, NotFoundException, ConflictException } from "@nestjs/common";
import { BookingsService } from "./bookings.service";
import { Booking } from "./bookings.entity";
import { ApiOperation, ApiTags, ApiResponse, ApiBody } from "@nestjs/swagger";

@ApiTags('bookings')
@Controller('bookings')
export class BookingsController {
}