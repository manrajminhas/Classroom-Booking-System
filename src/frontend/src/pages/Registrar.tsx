/**
 * Registrar component
 *
 * A management dashboard for registrar users.
 * Provides tools to:
 * - Add, delete, and upload classrooms via CSV
 * - Manage staff accounts (block / unblock users)
 * - Cancel existing bookings
 * - View system activity logs and analytics
 *
 * Displays a top-5 booked rooms chart using Recharts.
 * All data is loaded directly from the backend API.
 */

import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

/** Room row from /rooms */
interface Room {
  roomID: number;
  building: string;
  roomNumber: string;
  capacity: number;
}

/** Booking row from /bookings */
interface Booking {
  bookingID: number;
  startTime: string;
  endTime: string;
  attendees: number;
  user: { username: string };
  room: { building: string; roomNumber: string; capacity: number };
}

/** Log row from /logs/filter */
interface Log {
  id: number;
  action: string;
  actorUsername: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  details: string | null;
  after?: {
    startTime?: string;
    endTime?: string;
  };
}

/** Non-admin user for management table */
interface AppUser {
  userID: number;
  username: string;
  role: "staff" | "registrar" | "admin";
  isBlocked: boolean;
}

const API = "http://localhost:3001";

const Registrar: React.FC = () => {
  // -------------------- STATE --------------------
  const [rooms, setRooms] = useState<Room[]>([]);
  const [building, setBuilding] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState<number>(0);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [logs, setLogs] = useState<Log[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState("");
  const [users, setUsers] = useState<AppUser[]>([]);

  // -------------------- LOADERS --------------------

  /** Load rooms */
  const loadRooms = () => {
    fetch(`${API}/rooms`)
      .then((res) => res.json())
      .then((data: Room[]) => {
        const sorted = data.sort(sortRooms);
        setRooms(sorted);
        if (sorted.length > 0) {
          setSelectedKey(`${sorted[0].building}|${sorted[0].roomNumber}`);
        }
      })
      .catch((err) => console.error("Error loading rooms:", err));
  };

  /** Load last 10 logs for room/booking actions */
  const loadLogs = () => {
    fetch(`${API}/logs/filter?`)
      .then((res) => res.json())
      .then((data: Log[]) => {
        const filtered = data.filter(
          (log) =>
            log.action.startsWith("room.") || log.action.startsWith("booking.")
        );
        setLogs(filtered.slice(0, 10));
      })
      .catch((err) => console.error("Error loading logs:", err));
  };

  /** Load all bookings */
  const loadBookings = () => {
    fetch(`${API}/bookings`)
      .then((res) => res.json())
      .then((data: Booking[]) => setBookings(data))
      .catch((err) => console.error("Error loading bookings:", err));
  };

  /** Load users */
  const loadUsers = () => {
    fetch(`${API}/users`)
      .then((res) => res.json())
      .then((data: AppUser[]) => setUsers(data.filter((u) => u.role !== "admin")))
      .catch((err) => console.error("Error loading users:", err));
  };

  /** Toggle block/unblock for a user */
  const toggleUserStatus = async (user: AppUser) => {
    const newStatus = !user.isBlocked;

    if (
      !window.confirm(
        `Are you sure you want to ${newStatus ? "BLOCK" : "UNBLOCK"} user ${
          user.username
        }?`
      )
    )
      return;

    try {
      const res = await fetch(`${API}/users/${user.userID}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isBlocked: newStatus }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Failed to ${newStatus ? "block" : "unblock"} user`);
      }

      alert(
        `User ${user.username} successfully ${
          newStatus ? "BLOCKED" : "UNBLOCKED"
        }.`
      );

      loadUsers();
      loadLogs();
    } catch (err: any) {
      alert(`Error updating user status: ${err.message}`);
    }
  };

  // -------------------- MOUNT --------------------
  useEffect(() => {
    loadRooms();
    loadLogs();
    loadBookings();
    loadUsers();
  }, []);

  // -------------------- ACTIONS --------------------

  /** Add room via POST /rooms */
  const addRoom = async () => {
    if (!building.trim() || !roomNumber.trim()) {
      alert("Enter building and room number");
      return;
    }

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const username = user.username;

    const payload = {
      building: building.trim(),
      roomNumber: roomNumber.trim(),
      capacity: Number(capacity),
      username,
    };

    try {
      const res = await fetch(`${API}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to add room");
      }

      await res.json();
      alert("Room added!");
      setBuilding("");
      setRoomNumber("");
      setCapacity(0);
      loadRooms();
      loadLogs();
    } catch (err: any) {
      alert(`Error adding room: ${err.message}`);
    }
  };

  /** Delete selected room via DELETE /rooms/:building/:roomNumber */
  const deleteRoom = async () => {
    if (!selectedKey) return;
    const [b, rn] = selectedKey.split("|");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      const username = user.username;

      const res = await fetch(
        `${API}/rooms/${encodeURIComponent(b)}/${encodeURIComponent(rn)}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ username }),
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete room");
      }

      alert(`Deleted room ${b} ${rn}`);
      loadRooms();
      loadLogs();
    } catch (err: any) {
      alert(`Error deleting room: ${err.message}`);
    }
  };

  /** Upload CSV of rooms to /rooms/upload */
  const handleUploadCSV = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const username = user.username;

    setUploading(true);
    setUploadMessage("");

    const formData = new FormData();
    formData.append("file", file);
    if (username) formData.append("username", username);

    try {
      const res = await fetch(`${API}/rooms/upload`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to upload CSV");
      }

      const result = await res.json().catch(() => ({}));
      const count =
        result?.count || (Array.isArray(result) ? result.length : undefined);
      setUploadMessage(
        count ? `Uploaded ${count} rooms successfully.` : "Upload successful."
      );
      loadRooms();
      loadLogs();
    } catch (err: any) {
      console.error(err);
      setUploadMessage(`Error: ${err.message}`);
    } finally {
      setUploading(false);
      event.target.value = "";
    }
  };

  /** Cancel a booking via DELETE /bookings/:id */
  const cancelBooking = async (bookingID: number) => {
    if (!window.confirm("Are you sure you want to cancel this booking?")) return;

    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const username = user.username;

    try {
      const res = await fetch(`${API}/bookings/${bookingID}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Failed to delete booking");
      }

      alert("Booking cancelled!");
      loadBookings();
      loadLogs();
    } catch (err: any) {
      alert(`Error cancelling booking: ${err.message}`);
    }
  };

  // -------------------- HELPERS --------------------

  /** Format ISO */
  const formatDateTime = (t?: string) => {
    if (!t) return "—";
    const date = new Date(t);
    return date.toLocaleString([], {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  /** Aggregate counts for top-5 chart */
  const roomCounts = bookings.reduce<Record<string, number>>((acc, b) => {
    if (!b.room) return acc;
    const key = `${b.room.building} ${b.room.roomNumber}`;
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const topRooms = Object.entries(roomCounts)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);

  // -------------------- RENDER --------------------
  return (
    <div style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Registrar Panel</h1>

      {/* Room Management */}
      <section
        style={{
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Room Management</h2>

        <div style={{ marginBottom: "1rem" }}>
          <h4>Add Room</h4>
          <input
            placeholder="Building"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            style={{ marginRight: 8, padding: 6 }}
          />
          <input
            placeholder="Room Number"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            style={{ marginRight: 8, padding: 6 }}
          />
          <input
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
            style={{ marginRight: 8, padding: 6, width: 100 }}
          />
          <button
            onClick={addRoom}
            style={{
              background: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Add Room
          </button>
        </div>

        <div style={{ marginBottom: "1.5rem" }}>
          <h4>Delete Room</h4>
          <select
            value={selectedKey}
            onChange={(e) => setSelectedKey(e.target.value)}
            style={{ marginRight: 8, padding: 6 }}
          >
            {rooms.map((r) => (
              <option
                key={`${r.building}|${r.roomNumber}`}
                value={`${r.building}|${r.roomNumber}`}
              >
                {`${r.building} ${r.roomNumber} — Capacity: ${r.capacity}`}
              </option>
            ))}
          </select>
          <button
            onClick={deleteRoom}
            style={{
              background: "#dc3545",
              color: "white",
              border: "none",
              borderRadius: 4,
              padding: "6px 12px",
              cursor: "pointer",
            }}
          >
            Delete
          </button>
        </div>

        <div>
          <h4>Upload Room CSV</h4>
          <input
            type="file"
            accept=".csv"
            onChange={handleUploadCSV}
            disabled={uploading}
            style={{ marginRight: 8, padding: 6 }}
          />
          {uploading && <span>Uploading...</span>}
          {uploadMessage && (
            <p
              style={{
                marginTop: 8,
                color: uploadMessage.startsWith("Uploaded") ? "green" : "red",
              }}
            >
              {uploadMessage}
            </p>
          )}
        </div>
      </section>

      {/* User Management */}
      <section
        style={{
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2>User Management</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#efefef", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>User ID</th>
              <th style={{ padding: "8px" }}>Username</th>
              <th style={{ padding: "8px" }}>Role</th>
              <th style={{ padding: "8px" }}>Status</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "#888" }}>
                  No users available to manage
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.userID} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{user.userID}</td>
                  <td style={{ padding: "8px" }}>{user.username}</td>
                  <td style={{ padding: "8px" }}>{user.role}</td>
                  <td
                    style={{
                      padding: "8px",
                      color: user.isBlocked ? "red" : "green",
                      fontWeight: "bold",
                    }}
                  >
                    {user.isBlocked ? "BLOCKED" : "ACTIVE"}
                  </td>
                  <td style={{ padding: "8px" }}>
                    <button
                      onClick={() => toggleUserStatus(user)}
                      style={{
                        background: user.isBlocked ? "#28a745" : "#ffc107",
                        color: "white",
                        border: "none",
                        borderRadius: 4,
                        padding: "4px 8px",
                        cursor: "pointer",
                      }}
                    >
                      {user.isBlocked ? "Unblock" : "Block"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>

      {/* Top 5 Most Booked Rooms */}
      <section
        style={{
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2>Top 5 Most Booked Rooms</h2>
        {topRooms.length === 0 ? (
          <p style={{ color: "#888" }}>No booking data available</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={topRooms}
              margin={{ top: 20, right: 30, left: 10, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count" fill="#007bff" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </section>

      {/* All Bookings */}
      <section
        style={{
          background: "#f9f9f9",
          borderRadius: "8px",
          padding: "1rem",
          marginBottom: "2rem",
          boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h2>All Bookings</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#efefef", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Building</th>
              <th style={{ padding: "8px" }}>Room</th>
              <th style={{ padding: "8px" }}>Start</th>
              <th style={{ padding: "8px" }}>End</th>
              <th style={{ padding: "8px" }}>Attendees / Capacity</th>
              <th style={{ padding: "8px" }}>Booked By</th>
              <th style={{ padding: "8px" }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {bookings.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#888" }}>
                  No current bookings
                </td>
              </tr>
            ) : (
              bookings.map((b) => {
                const capacity = b.room.capacity;
                const highlight = capacity > 0 && b.attendees < capacity / 2;
                return (
                  <tr
                    key={b.bookingID}
                    style={{
                      borderBottom: "1px solid #ddd",
                      backgroundColor: highlight ? "#ffe5e5" : undefined,
                      color: highlight ? "#a40000" : undefined,
                      fontWeight: highlight ? 600 : undefined,
                    }}
                  >
                    <td style={{ padding: "8px" }}>{b.room?.building}</td>
                    <td style={{ padding: "8px" }}>{b.room?.roomNumber}</td>
                    <td style={{ padding: "8px" }}>
                      {formatDateTime(b.startTime)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {formatDateTime(b.endTime)}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {b.attendees} / {b.room.capacity}
                    </td>
                    <td style={{ padding: "8px" }}>
                      {b.user?.username || "Unknown"}
                    </td>
                    <td style={{ padding: "8px" }}>
                      <button
                        onClick={() => cancelBooking(b.bookingID)}
                        style={{
                          background: "#dc3545",
                          color: "white",
                          border: "none",
                          borderRadius: 4,
                          padding: "4px 8px",
                          cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Recent Activity */}
      <section>
        <h2>Recent Activity</h2>
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            marginTop: "1rem",
          }}
        >
          <thead>
            <tr style={{ backgroundColor: "#efefef", textAlign: "left" }}>
              <th style={{ padding: "8px" }}>Time (Log)</th>
              <th style={{ padding: "8px" }}>Actor</th>
              <th style={{ padding: "8px" }}>Action</th>
              <th style={{ padding: "8px" }}>Target</th>
              <th style={{ padding: "8px" }}>Start Time</th>
              <th style={{ padding: "8px" }}>End Time</th>
              <th style={{ padding: "8px" }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: "center", color: "#888" }}>
                  No recent activity
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {log.actorUsername || "System"}
                  </td>
                  <td style={{ padding: "8px" }}>{log.action}</td>
                  <td style={{ padding: "8px" }}>
                    {log.targetType} {log.targetId}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {formatDateTime(log.after?.startTime)}
                  </td>
                  <td style={{ padding: "8px" }}>
                    {formatDateTime(log.after?.endTime)}
                  </td>
                  <td style={{ padding: "8px" }}>{log.details || "-"}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

/** Sort rooms by building, then roomNumber*/
function sortRooms(a: Room, b: Room) {
  const ab = a.building.localeCompare(b.building);
  if (ab !== 0) return ab;
  return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
}

export default Registrar;