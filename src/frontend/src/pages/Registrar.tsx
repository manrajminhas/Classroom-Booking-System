import React, { useEffect, useState } from "react";

type Room = {
  roomID: number;
  building: string;
  roomNumber: string;
  capacity: number;
};

type Log = {
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
};

const API = "http://localhost:3001";

const Registrar: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [building, setBuilding] = useState("");
  const [roomNumber, setRoomNumber] = useState("");
  const [capacity, setCapacity] = useState<number>(12);
  const [selectedKey, setSelectedKey] = useState<string>("");
  const [logs, setLogs] = useState<Log[]>([]);

  useEffect(() => {
    loadRooms();
    loadLogs();
  }, []);

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

  const loadLogs = () => {
    fetch(`${API}/logs/filter?`)
      .then((res) => res.json())
      .then((data: Log[]) => {
        const filtered = data.filter(
          (log) => log.action.startsWith("room.") || log.action.startsWith("booking.")
        );
        setLogs(filtered.slice(0, 10));
      })
      .catch((err) => console.error("Error loading logs:", err));
  };

  const addRoom = async () => {
    if (!building.trim() || !roomNumber.trim()) {
      alert("Enter building and room number");
      return;
    }

    const payload = {
      building: building.trim(),
      roomNumber: roomNumber.trim(),
      capacity: Number(capacity),
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
      setCapacity(12);
      loadRooms();
      loadLogs();
    } catch (err: any) {
      alert(`Error adding room: ${err.message}`);
    }
  };

  const deleteRoom = async () => {
    if (!selectedKey) return;
    const [b, rn] = selectedKey.split("|");

    try {
      const res = await fetch(
        `${API}/rooms/${encodeURIComponent(b)}/${encodeURIComponent(rn)}`,
        { method: "DELETE" }
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

  const formatTime = (t?: string) => {
    if (!t) return "—";
    return new Date(t).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

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

        <div>
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
      </section>

      {/* Logs Table */}
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
                <td colSpan={7} style={{ padding: "1rem", textAlign: "center", color: "#888" }}>
                  No recent activity
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid #ddd" }}>
                  <td style={{ padding: "8px" }}>{new Date(log.createdAt).toLocaleString()}</td>
                  <td style={{ padding: "8px" }}>{log.actorUsername || "System"}</td>
                  <td style={{ padding: "8px" }}>{log.action}</td>
                  <td style={{ padding: "8px" }}>{log.targetType} {log.targetId}</td>
                  <td style={{ padding: "8px" }}>{formatTime(log.after?.startTime)}</td>
                  <td style={{ padding: "8px" }}>{formatTime(log.after?.endTime)}</td>
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

function sortRooms(a: Room, b: Room) {
  const ab = a.building.localeCompare(b.building);
  if (ab !== 0) return ab;
  return a.roomNumber.localeCompare(b.roomNumber, undefined, { numeric: true });
}

export default Registrar;