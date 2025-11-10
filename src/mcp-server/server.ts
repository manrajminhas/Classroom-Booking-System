import { z } from 'zod';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import axios, { AxiosRequestConfig } from 'axios';

const BACKEND_URL = process.env.BACKEND_URL || 'http://backend:3001';
const BACKEND_AUTH_TOKEN = process.env.BACKEND_AUTH_TOKEN || '';

const axiosConfig: AxiosRequestConfig = BACKEND_AUTH_TOKEN
	? { headers: { Authorization: `Bearer ${BACKEND_AUTH_TOKEN}` }, timeout: 5000 }
	: { timeout: 5000 };

const server = new McpServer({ name: 'room-booking', version: '1.0.0' });

server.registerTool(
	'list_all_rooms',
	{
		description: 'Get a list of all rooms',
		inputSchema: {},
	},
	async () => {
		try {
			const res = await axios.get(`${BACKEND_URL}/rooms`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'find_room_by_location',
	{
		description: 'Find a room by building and room number',
		inputSchema: {
			building: z.string(),
			roomNumber: z.string(),
		},
	},
	async ({ building, roomNumber }) => {
		try {
			const res = await axios.get(
				`${BACKEND_URL}/rooms/${encodeURIComponent(building)}/${encodeURIComponent(roomNumber)}`,
				axiosConfig
			);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'find_rooms_by_building',
	{
		description: 'Find all rooms in a specific building',
		inputSchema: { building: z.string() },
	},
	async ({ building }) => {
		try {
			const res = await axios.get(`${BACKEND_URL}/rooms/building/${encodeURIComponent(building)}`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'find_rooms_by_capacity',
	{
		description: 'Find rooms with at least the given capacity',
		inputSchema: { capacity: z.number() },
	},
	async ({ capacity }) => {
		try {
			const res = await axios.get(`${BACKEND_URL}/rooms/capacity/${capacity}`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'get_room_bookings',
	{
		description: 'Get all bookings for a specific room',
		inputSchema: { roomID: z.number() },
	},
	async ({ roomID }) => {
		try {
			const res = await axios.get(`${BACKEND_URL}/bookings/room/${roomID}`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'get_user_bookings',
	{
		description: 'Get all bookings for a specific user (by username)',
		inputSchema: { username: z.string() },
	},
	async ({ username }) => {
		try {
			const res = await axios.get(`${BACKEND_URL}/bookings/${encodeURIComponent(username)}`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'create_booking',
	{
		description: 'Create a new room booking (provide username, building, roomNumber, start/end time, attendees)',
		inputSchema: {
			username: z.string(),
			building: z.string(),
			roomNumber: z.string(),
			startTime: z.string(),
			endTime: z.string(),
			attendees: z.number(),
		},
	},
	async ({ username, building, roomNumber, startTime, endTime, attendees }) => {
		try {
			const payload = { username, startTime, endTime, attendees };
			const res = await axios.post(
				`${BACKEND_URL}/bookings/${encodeURIComponent(building)}/${encodeURIComponent(roomNumber)}`,
				payload,
				axiosConfig
			);
			return { content: [{ type: 'text', text: JSON.stringify(res.data) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

server.registerTool(
	'cancel_booking',
	{
		description: 'Cancel an existing booking',
		inputSchema: { id: z.number() },
	},
	async ({ id }) => {
		try {
			await axios.delete(`${BACKEND_URL}/bookings/${id}`, axiosConfig);
			return { content: [{ type: 'text', text: JSON.stringify({ success: true, id }) }] };
		} catch (err: any) {
			return { content: [{ type: 'text', text: err.response?.data?.message || err.message }], isError: true };
		}
	}
);

// Start the server
const transport = new StdioServerTransport();
await server.connect(transport);
