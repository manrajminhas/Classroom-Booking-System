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
          (log) =>
            log.action.startsWith("room.") ||
            log.action.startsWith("booking.")
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

  return (
    <div style={{ padding: 16 }}>
      <h2>Registrar Panel</h2>

      <section style={{ marginBottom: 24 }}>
        <h4>Add Room</h4>
        <input
          placeholder="Building"
          value={building}
          onChange={(e) => setBuilding(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          placeholder="Room Number"
          value={roomNumber}
          onChange={(e) => setRoomNumber(e.target.value)}
          style={{ marginRight: 8 }}
        />
        <input
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
          style={{ marginRight: 8, width: 80 }}
        />
        <button onClick={addRoom}>Add Room</button>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h4>Delete Room</h4>
        <select
          value={selectedKey}
          onChange={(e) => setSelectedKey(e.target.value)}
          style={{ marginRight: 8 }}
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
        <button onClick={deleteRoom}>Delete</button>
      </section>

      <section>
        <h4>Recent Activity</h4>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Time</th>
              <th>Actor</th>
              <th>Action</th>
              <th>Target</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: "center", color: "gray" }}>
                  No recent activity
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
                  <td>{log.actorUsername || "System"}</td>
                  <td>{log.action}</td>
                  <td>{log.targetType} {log.targetId}</td>
                  <td>{log.details || "-"}</td>
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