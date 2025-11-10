# API Documentation

The Room Booking API provides endpoints for managing classrooms, bookings, users, and system logs.  
This documentation summarizes what each endpoint group does and why it exists.  
Full technical details and request/response schemas are viewable in **Swagger UI** once the backend is running.

---

## Accessing the API Docs

- **Base URL:** `http://localhost:3001`
- **Swagger UI:** `http://localhost:3001/api`

---

## Health and Root

### `GET /`
Displays a short welcome message — confirms that the backend container is reachable.

### `GET /health`
Checks system health by returning uptime and a timestamp.  
Used by Docker, deployment scripts, or CI/CD monitors.

---

## Rooms (`/rooms`)

Endpoints for managing classrooms and their capacities.

### Why
Allows administrators or registrars to create, update, delete, or bulk-import rooms so that bookings always reference valid spaces.

### Endpoints
| Method | Path | Purpose |
|--------|------|----------|
| GET | `/rooms` | List all rooms. |
| GET | `/rooms/building/{building}` | List rooms in a specific building. |
| GET | `/rooms/capacity/{capacity}` | List rooms with capacity ≥ given value. |
| POST | `/rooms` | Create a new room. |
| PUT | `/rooms/{building}/{roomNumber}` | Update details for an existing room. |
| DELETE | `/rooms/{building}/{roomNumber}` | Delete one room. |
| POST | `/rooms/upload` | Import multiple rooms from CSV (includes username for audit logging). |
| DELETE | `/rooms` | Delete all rooms from the system (admin only). |

---

## Bookings (`/bookings`)

Endpoints for scheduling and managing classroom reservations.

### Why
Enables students and staff to book, cancel, or view available classrooms while preventing overlap conflicts.

### Endpoints
| Method | Path | Purpose |
|--------|------|----------|
| GET | `/bookings` | Retrieve all bookings. |
| GET | `/bookings/available?start=&end=&capacity=` | Find rooms available in a specific time range. |
| POST | `/bookings/{building}/{roomNumber}` | Create a new booking. Requires `startTime`, `endTime`, `attendees`, and `username`. |
| GET | `/bookings/bookings/{username}` | Get all bookings for a user. |
| GET | `/bookings/date/{date}` | Find bookings on a given date. |
| GET | `/bookings/room/{roomID}` | Find bookings for a room by ID. |
| GET | `/bookings/user/{username}/past` | Find a user’s past bookings. |
| GET | `/bookings/user/{username}/future` | Find a user’s future bookings. |
| DELETE | `/bookings/{bookingID}` | Cancel one booking (logs actor). |
| DELETE | `/bookings` | Delete all bookings (admin/test cleanup). |

---

## Users (`/users`)

Endpoints for managing accounts and linking actions to authenticated users.

### Why
Identifies who made each booking or system change; allows login and registrar role separation.

### Endpoints
| Method | Path | Purpose |
|--------|------|----------|
| GET | `/users` | List all users. |
| POST | `/users` | Register a new user. |
| GET | `/users/{username}` | Retrieve user details. |
| POST | `/users/login` | Authenticate and return JWT. |
| DELETE | `/users/{userID}` | Remove a user. |

---

## Logs (`/logs`)

Endpoints for viewing audit logs of system events.

### Why
Tracks every create, delete, or import for accountability and debugging.

### Endpoints
| Method | Path | Purpose |
|--------|------|----------|
| GET | `/logs` | Get all logs. |
| GET | `/logs/filter` | Filter logs by type, actor, or time. |
| GET | `/logs/registrar` | Get registrar-specific logs. |
| GET | `/logs/admin` | Get admin-specific logs. |
| POST | `/logs` | Add a custom log entry (used internally by other controllers). |

---
> **Note:** Full API schemas, response formats, and example requests are viewable in Swagger UI (`http://localhost:3001/api`).