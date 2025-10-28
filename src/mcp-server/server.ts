import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3001';

const server = new Server(
    { name: 'room-booking', version: '1.0.0' },
    { capabilities: { tools: {} } }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
        tools: [
            {
                name: 'list_all_rooms',
                description: 'Get a list of all rooms',
                inputSchema: { type: 'object', properties: {} }
            },
            {
                name: 'find_room_by_location',
                description: 'Find a room by building and room number',
                inputSchema: {
                    type: 'object',
                    properties: {
                        building: { type: 'string', description: 'Building name' },
                        roomNumber: { type: 'string', description: 'Room number' }
                    },
                    required: ['building', 'roomNumber']
                }
            },
            {
                name: 'find_rooms_by_building',
                description: 'Find all rooms in a specific building',
                inputSchema: {
                    type: 'object',
                    properties: { building: { type: 'string', description: 'Building name' } },
                    required: ['building']
                }
            },
            {
                name: 'find_rooms_by_capacity',
                description: 'Find rooms with at least the given capacity',
                inputSchema: {
                    type: 'object',
                    properties: { capacity: { type: 'number', description: 'Minimum capacity' } },
                    required: ['capacity']
                }
            },
            {
                name: 'get_room_bookings',
                description: 'Get all bookings for a specific room',
                inputSchema: {
                    type: 'object',
                    properties: { roomID: { type: 'number', description: 'Room ID' } },
                    required: ['roomID']
                }
            },
            {
                name: 'get_user_bookings',
                description: 'Get all bookings for a specific user',
                inputSchema: {
                    type: 'object',
                    properties: { userID: { type: 'number', description: 'User ID' } },
                    required: ['userID']
                }
            },
            {
                name: 'create_booking',
                description: 'Create a new room booking',
                inputSchema: {
                    type: 'object',
                    properties: {
                        userID: { type: 'number', description: 'User ID' },
                        roomID: { type: 'number', description: 'Room ID' },
                        startTime: { type: 'string', description: 'Start time' },
                        endTime: { type: 'string', description: 'End time' },
                        attendees: { type: 'number', description: 'Number of attendees' }
                    },
                    required: ['userID', 'roomID', 'startTime', 'endTime', 'attendees']
                }
            },
            {
                name: 'update_booking',
                description: 'Update an existing booking (times and/or attendees)',
                inputSchema: {
                    type: 'object',
                    properties: {
                        id: { type: 'number', description: 'Booking ID' },
                        startTime: { type: 'string', description: 'Start time (optional)' },
                        endTime: { type: 'string', description: 'End time (optional)' },
                        attendees: { type: 'number', description: 'Number of attendees (optional)' }
                    },
                    required: ['id']
                }
            },
            {
                name: 'cancel_booking',
                description: 'Cancel an existing booking',
                inputSchema: {
                    type: 'object',
                    properties: { id: { type: 'number', description: 'Booking ID to cancel' } },
                    required: ['id']
                }
            }
        ]
    };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
        switch (name) {
            case 'list_all_rooms': {
                const res = await axios.get(`${BACKEND_URL}/rooms`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'find_room_by_location': {
                const { building, roomNumber } = args as { building: string; roomNumber: string };
                const res = await axios.get(`${BACKEND_URL}/rooms/${building}/${roomNumber}`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'find_rooms_by_building': {
                const { building } = args as { building: string };
                const res = await axios.get(`${BACKEND_URL}/rooms/building/${building}`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'find_rooms_by_capacity': {
                const { capacity } = args as { capacity: number };
                const res = await axios.get(`${BACKEND_URL}/rooms/capacity/${capacity}`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'get_room_bookings': {
                const { roomID } = args as { roomID: number };
                const res = await axios.get(`${BACKEND_URL}/bookings/room/${roomID}`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'get_user_bookings': {
                const { userID } = args as { userID: number };
                const res = await axios.get(`${BACKEND_URL}/bookings/user/${userID}`);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'create_booking': {
                const res = await axios.post(`${BACKEND_URL}/bookings`, args);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'update_booking': {
                const { id, ...updateData } = args as any;
                const res = await axios.patch(`${BACKEND_URL}/bookings/${id}`, updateData);
                return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
            }

            case 'cancel_booking': {
                const { id } = args as { id: number };
                await axios.delete(`${BACKEND_URL}/bookings/${id}`);
                return { content: [{ type: 'text', text: JSON.stringify({ success: true, id }) }] };
            }

            default:
                throw new Error(`Unknown tool: ${name}`);
        }
    } catch (error: any) {
        return {
            content: [{
                type: 'text',
                text: JSON.stringify({
                    error: error.response?.data?.message || error.message
                })
            }],
            isError: true
        };
    }
});

// Start the server
const transport = new StdioServerTransport();
server.connect(transport);