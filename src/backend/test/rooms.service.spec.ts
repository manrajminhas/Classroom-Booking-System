import 'reflect-metadata';
import { describe, it, beforeEach, afterEach, expect } from 'vitest';
import { DataSource } from 'typeorm';
import { RoomsService } from 'src/rooms/rooms.service';
import { Booking } from 'src/bookings/bookings.entity';
import { User } from 'src/users/users.entity';
import { Room } from 'src/rooms/rooms.entity';

describe('RoomsService', () => {
    let dataSource: DataSource;
    let roomsService: RoomsService;

    beforeEach(async () => { // Use an in-memory SQLite DB for testing
        dataSource = new DataSource({
            type: 'sqlite',
            database: ':memory:',
            synchronize: true,
            dropSchema: true,
            entities: [Room, User, Booking]
        });
        await dataSource.initialize();

        roomsService = new RoomsService(dataSource.getRepository(Room));
    });

    afterEach(async () => {
        await dataSource.destroy(); // Clean up the DB
    });

    it('should be defined', () => {
        expect(roomsService).toBeDefined();
    });

    describe('create', () => {
        it('should create and return a new room', async () => {
            const roomData = { 
                building: 'ECS',
                roomNumber: '123',
                capacity: 75,
                avEquipment: '1 digital video projector; 1 document camera'
            };
            const room = await roomsService.create(roomData);
            expect(room).toHaveProperty('roomID');
            expect(room.building).toBe('ECS');
            expect(room.roomNumber).toBe('123');
            expect(room.capacity).toBe(75);
        });

        it('should not add duplicate rooms', async () => {
            const roomData = {
                building: 'ELW',
                roomNumber: '220',
                capacity: 35,
                avEquipment: 'Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
            };
            await roomsService.create(roomData);
        
            // Try creating the same room
            await expect(roomsService.create(roomData)).rejects.toThrow();
        });

        it('should not allow non-positive capacities', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 0,
                avEquipment: '1 digital video projector; A built-in classroom computer with webcam'
            };
            await expect(roomsService.create(roomData))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should not allow non-integer capacities', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 20.5,
                avEquipment: '1 digital video projector; A built-in classroom computer with webcam'
            };
            await expect(roomsService.create(roomData))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should allow multiple rooms in the same building with different room numbers', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 60,
                avEquipment: '1 digital video projector; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio)'
            };   
            
            const roomData2 = {
                building: 'ECS',
                roomNumber: '105',
                capacity: 75,
                avEquipment: '1 digital video projector; A built-in classroom computer with webcam'
            };             
            
            const room1 = await roomsService.create(roomData1);
            const room2 = await roomsService.create(roomData2);

            const rooms = await roomsService.findAll();

            expect(room1.roomID).not.toBe(room2.roomID);
            expect(rooms.length).toBe(2);
        });

        it('should allow rooms in different buildings with the same room number', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 60,
                avEquipment: '1 digital video projector; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio)'
            };   
            
            const roomData2 = {
                building: 'COR',
                roomNumber: '101',
                capacity: 35,
                avEquipment: 'A built-in classroom computer with webcam'
            };   

            const room1 = await roomsService.create(roomData1);
            const room2 = await roomsService.create(roomData2);

            const rooms = await roomsService.findAll();
            
            expect(room1.roomID).not.toBe(room2.roomID);
            expect(rooms.length).toBe(2);
        });

        it('should require a building and room number', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '',
                capacity: 95,
                avEquipment: '1 digital video projector; A built-in classroom computer with webcam'
            }
            const roomData2 = {
                building: '',
                roomNumber: '123',
                capacity: 60,
                avEquipment: '1 digital video projector; A built-in classroom computer with webcam'            
            };
            
            await expect(roomsService.create(roomData1))
                .rejects.toThrow('Building and room number are required');
            await expect(roomsService.create(roomData2))
                .rejects.toThrow('Building and room number are required');
        });
    });

    describe('findAll', () => {
        it('should return all rooms (small number)', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Room speakers'
            };

            const roomData2 = {
                building: 'ELW',
                roomNumber: '220',
                capacity: 35,
                avEquipment: 'A built-in classroom computer with webcam'
            };

            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            
            const rooms = await roomsService.findAll();
            expect(rooms.length).toBe(2);
        });

        it('should return all rooms (large number)', async () => {
            for (let i = 1; i <= 500; i++) {
                const roomData = {
                    building:'COR',
                    roomNumber: `R${i}`,
                    capacity: 90,
                    avEquipment: 'A built-in classroom computer with webcam'
                };
                await roomsService.create(roomData);
            }
            const rooms = await roomsService.findAll();
            expect(rooms.length).toBe(500);
        });
    });

    describe('findByLocation', () => {
        it('should find a room by building and room number', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: '2 document cameras; 3 digital video projectors'
            };
            await roomsService.create(roomData);

            const room = await roomsService.findByLocation('ECS', '101');
            expect(room).toHaveProperty('roomID');
            expect(room?.building).toBe('ECS');
            expect(room?.roomNumber).toBe('101');
            expect(room?.capacity).toBe(50);
        });

        it('should return null if no matching room is found', async () => {
            const room = await roomsService.findByLocation('ECS', '3456');
            expect(room).toBeNull();
        });

        it('should return the correct room when multiple rooms exist', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: '1 digital video projector; 1 document camera; A built-in classroom computer with webcam; Lecture capture capability'
            };
            const roomData2 = {
                building: 'ECS',
                roomNumber: '102',
                capacity: 60,
                avEquipment: 'Lecture capture capability'    
            };

            await roomsService.create(roomData1);
            await roomsService.create(roomData2);

            const room = await roomsService.findByLocation('ECS', '102');
            expect(room).toHaveProperty('roomID');
            expect(room?.building).toBe('ECS');
            expect(room?.roomNumber).toBe('102');
            expect(room?.capacity).toBe(60);
        });

        it('should return null if building or room number do not match', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: '1 digital video projector; 1 document camera; A built-in classroom computer with webcam; Lecture capture capability'
            };
            await roomsService.create(roomData);
            
            const room1 = await roomsService.findByLocation('ELW', '101');
            const room2 = await roomsService.findByLocation('ECS', '102');
            expect(room1).toBeNull();
            expect(room2).toBeNull();
        });

        it('should distinguish between rooms with the same number in different buildings', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: '1 digital video projector; Lecture capture capability'
            };
            const roomData2 = {
                building: 'ELW',
                roomNumber: '101',
                capacity: 60,
                avEquipment: '1 digital video projector; 1 document camera; A built-in classroom computer with webcam; Lecture capture capability'
            };

            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            
            const room1 = await roomsService.findByLocation('ECS', '101');
            const room2 = await roomsService.findByLocation('ELW', '101');
            expect(room1).not.toBeNull();
            expect(room2).not.toBeNull();
            expect(room1?.roomID).not.toBe(room2?.roomID);
        });

        it('should handle large numbers of rooms', async () => {
            for (let i = 1; i <= 200; i++) {
                const roomData = {
                    building: 'COR',
                    roomNumber: `R${i}`,
                    capacity: 58,
                    avEquipment: 'Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
                };
                await roomsService.create(roomData);
            }

            const room = await roomsService.findByLocation('COR', 'R150');
            expect(room?.building).toBe('COR');
            expect(room?.roomNumber).toBe('R150');
        });
    });

    describe('findByBuilding', () => {
        it('should find all rooms in a building', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Podium'
            };
            const roomData2 = {
                building: 'ECS',
                roomNumber: '102',
                capacity: 90,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Podium'
            };
            const roomData3 = {
                building: 'ELW',
                roomNumber: '210',
                capacity: 35,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Podium'
            };

            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            await roomsService.create(roomData3);

            const rooms = await roomsService.findByBuilding('ECS');
            expect(rooms.length).toBe(2);
            expect(rooms[0].building).toBe('ECS');
            expect(rooms[1].building).toBe('ECS');
            expect(rooms[0].roomNumber).toBe('101');
            expect(rooms[1].roomNumber).toBe('102');
        });

        it('should return an empty array if no rooms exist in the building', async () => {
            const rooms = await roomsService.findByBuilding('COR');
            expect(rooms.length).toBe(0);
        });

        it('should return rooms sorted by room number', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '202',
                capacity: 35,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Podium'
            };
            const roomData2 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 184,
                avEquipment: 'A built-in classroom computer with webcam; Podium'
            };
            const roomData3 = {
                building: 'ECS',
                roomNumber: '150',
                capacity: 68,
                avEquipment: 'A built-in classroom computer with webcam; Lecture capture capability; Podium'
            };

            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            await roomsService.create(roomData3);
            
            const rooms = await roomsService.findByBuilding('ECS');
            expect(rooms.length).toBe(3);
            expect(rooms[0].roomNumber).toBe('101');
            expect(rooms[1].roomNumber).toBe('150');
            expect(rooms[2].roomNumber).toBe('202');
        });

        it('should handle large numbers of rooms', async () => {
            for (let i = 1; i <= 300; i++) {
                const roomData = {
                    building: 'COR',
                    roomNumber: `R${i}`,
                    capacity: 45,
                    avEquipment: '1 digital video projector; 1 document camera; A built-in classroom computer with webcam'
                };
                await roomsService.create(roomData);
            }
            const rooms = await roomsService.findByBuilding('COR');
            expect(rooms.length).toBe(300);
            expect(rooms[0].roomNumber).toBe('R1');
            expect(rooms[299].roomNumber).toBe('R99');
        });
    });

    describe('findByCapacity', () => {
        it('should find all rooms with at least the given capacity', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
            };
            const roomData2 = {
                building: 'ECS',
                roomNumber: '102',
                capacity: 90,
                avEquipment: 'Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
            };
            const roomData3 = {
                building: 'ELW',
                roomNumber: '210',
                capacity: 35,
                avEquipment: 'Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'            
            };
            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            await roomsService.create(roomData3);
            
            const rooms = await roomsService.findByCapacity(50);
            expect(rooms.length).toBe(2);
            expect(rooms[0].capacity).toBeGreaterThanOrEqual(50);
            expect(rooms[1].capacity).toBeGreaterThanOrEqual(50);
        });

        it('should return an empty array if no rooms meet the capacity requirement', async () => {
            const roomData1 = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Podium; Room speakers'
            };
            const roomData2 = {
                building: 'ECS',
                roomNumber: '102',
                capacity: 90,
                avEquipment: 'Podium; Room speakers'
            };
            await roomsService.create(roomData1);
            await roomsService.create(roomData2);
            
            const rooms = await roomsService.findByCapacity(100);
            expect(rooms.length).toBe(0);
        });

        it('should not accept non-positive capacities', async () => {
            await expect(roomsService.findByCapacity(0))
                .rejects.toThrow('Room capacity must be a positive integer');
            
            await expect(roomsService.findByCapacity(-20))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should not accept non-integer capacities', async () => {
            await expect(roomsService.findByCapacity(235.93))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should handle large numbers of rooms', async () => {
            for (let i = 1; i <= 400; i++) {
                const roomData = {
                    building: 'HSD',
                    roomNumber: `A${i}`,
                    capacity: i,
                    avEquipment: '1 document camera; A built-in classroom computer with webcam'
                };
                await roomsService.create(roomData);
            }
            const rooms = await roomsService.findByCapacity(350);
            expect(rooms.length).toBe(51);
            expect(rooms[0].capacity).toBe(350);
            expect(rooms[50].capacity).toBe(400);
        });
    });

    describe('findByID', () => {
        it('should find a room by ID', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: '1 document camera; A built-in classroom computer with webcam'
            };
            const createdRoom = await roomsService.create(roomData);

            const room = await roomsService.findByID(createdRoom.roomID);
            expect(room?.roomID).toBe(createdRoom.roomID);
            expect(room?.building).toBe('ECS');
            expect(room?.roomNumber).toBe('101');
            expect(room?.capacity).toBe(50);
        });

        it('should return null if no room with the given ID exists', async () => {
            const room = await roomsService.findByID(9999);
            expect(room).toBeNull();
        });

        it('should handle large numbers of rooms', async () => {
            for (let i = 1; i <= 750; i++) {
                const roomData = {
                    building: 'COR',
                    roomNumber: `R${i}`,
                    capacity: 70,
                    avEquipment: 'Room speakers; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
                };
                await roomsService.create(roomData);
            }
            const foundRoom = await roomsService.findByID(750);
            expect(foundRoom?.roomID).toBe(750);
            expect(foundRoom?.building).toBe('COR');
            expect(foundRoom?.roomNumber).toBe('R750');
        });
    });

    describe('update', () => {
        it('should update a room\'s capacity', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
            };
            const room = await roomsService.create(roomData);

            const updatedRoom = await roomsService.update(room.roomID, { capacity: 75 });
            expect(updatedRoom?.roomID).toBe(room.roomID);
            expect(updatedRoom?.building).toBe('ECS');
            expect(updatedRoom?.roomNumber).toBe('101');
            expect(updatedRoom?.capacity).toBe(75);
            expect(updatedRoom?.avEquipment).toBe('Room speakers; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic');
        });

        it('should not update a room to a non-positive capacity', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Video and audio laptop connectors (HDMI, VGA, 3.5mm audio); Wireless mic'
            };

            const room = await roomsService.create(roomData);

            await expect(roomsService.update(room.roomID, { capacity: 0 }))
                .rejects.toThrow('Room capacity must be a positive integer');

            await expect(roomsService.update(room.roomID, { capacity: -30 }))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should not update a room to a non-integer capacity', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Podium; Room speakers; Touch panel controls for AV system'
            };
            const room = await roomsService.create(roomData);

            await expect(roomsService.update(room.roomID, { capacity: 42.1 }))
                .rejects.toThrow('Room capacity must be a positive integer');
        });

        it('should return null when trying to update a non-existent room', async () => {
            const updatedRoom = await roomsService.update(9999, { capacity: 80 });
            expect(updatedRoom).toBeNull();
        });

        it('should add to a room\'s AV equipment', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Wireless mic'
            };

            const room = await roomsService.create(roomData);

            const updatedRoom = await roomsService.update(room.roomID, { avEquipment: 'Room speakers; Wireless mic; Podium' });
            expect(updatedRoom?.roomID).toBe(room.roomID);
            expect(updatedRoom?.building).toBe('ECS');
            expect(updatedRoom?.roomNumber).toBe('101');
            expect(updatedRoom?.capacity).toBe(50);
            expect(updatedRoom?.avEquipment).toBe('Room speakers; Wireless mic; Podium');
        });

        it('should remove from a room\'s AV equipment', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Wireless mic'
            };

            const room = await roomsService.create(roomData);

            const updatedRoom = await roomsService.update(room.roomID, { avEquipment: 'Room speakers' });
            expect(updatedRoom?.roomID).toBe(room.roomID);
            expect(updatedRoom?.building).toBe('ECS');
            expect(updatedRoom?.roomNumber).toBe('101');
            expect(updatedRoom?.capacity).toBe(50);
            expect(updatedRoom?.avEquipment).toBe('Room speakers');
        });

        it('should update a room\'s capacity and AV equipment', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Projector; Wireless mic'
            };

            const room = await roomsService.create(roomData);

            const updatedRoom = await roomsService.update(room.roomID, { capacity: 45, avEquipment: 'Room speakers; Projector; Wireless mic; Lecture recording capabilities' });
            expect(updatedRoom?.roomID).toBe(room.roomID);
            expect(updatedRoom?.building).toBe('ECS');
            expect(updatedRoom?.roomNumber).toBe('101');
            expect(updatedRoom?.capacity).toBe(45);
            expect(updatedRoom?.avEquipment).toBe('Room speakers; Projector; Wireless mic; Lecture recording capabilities');
        });

        it('should not make any changes when no arguments passed in', async () => {
             const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Projector; Wireless mic'
            };

            const room = await roomsService.create(roomData);

            const updatedRoom = await roomsService.update(room.roomID, { });
            expect(updatedRoom?.roomID).toBe(room.roomID);
            expect(updatedRoom?.building).toBe('ECS');
            expect(updatedRoom?.roomNumber).toBe('101');
            expect(updatedRoom?.capacity).toBe(50);
            expect(updatedRoom?.avEquipment).toBe('Room speakers; Projector; Wireless mic');           
        });
    });

    describe('delete', () => {
        it('should delete a room by ID', async () => {
            const roomData = {
                building: 'ECS',
                roomNumber: '101',
                capacity: 50,
                avEquipment: 'Room speakers; Touch panel controls for AV system'
            };
            const room = await roomsService.create(roomData);

            const deleteResult = await roomsService.delete(room.roomID);
            expect(deleteResult).toBe(true);

            const foundRoom = await roomsService.findByID(room.roomID);
            expect(foundRoom).toBeNull();
        });

        it('should return false when trying to delete a non-existent room', async () => {
            const deleteResult = await roomsService.delete(42);
            expect(deleteResult).toBe(false);
        });

        it('should handle large numbers of rooms', async () => {
            for (let i = 1; i <= 600; i++) {
                const roomData = {
                    building: 'COR',
                    roomNumber: `R${i}`,
                    capacity: 80,
                    avEquipment: 'Podium'
                };
                await roomsService.create(roomData);
            }
            const deleteResult = await roomsService.delete(562);
            expect(deleteResult).toBe(true);
            
            const foundRoom = await roomsService.findByID(562);
            expect(foundRoom).toBeNull();
        }); 
    });
});