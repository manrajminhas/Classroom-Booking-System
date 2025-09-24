import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Room } from './rooms.entity';

@Injectable()
export class RoomsService {
    private roomsRepository: Repository<Room>;

    constructor(@InjectRepository(Room) roomsRepository: Repository<Room>) {
        this.roomsRepository = roomsRepository;
    }

    async findAll(): Promise<Room[]> {
        return this.roomsRepository.find();
    }
}