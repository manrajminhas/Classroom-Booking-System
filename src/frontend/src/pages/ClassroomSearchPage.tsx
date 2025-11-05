import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ClassroomSearchPage.css';

interface Room {
  roomID: number;
  building: string;
  roomNumber: string;
  capacity: number;
}

export interface Booking {
  bookingID: number;
  startTime: string;
  endTime: string;
  attendees: number;
  room?: {
    building: string;
    roomNumber: string;
  };
}

const ClassRoomSearchPage: React.FC = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedClassroom, setSelectedClassroom] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');

  const times = [
    "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
    "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
    "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
    "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
  ];

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    axios.get('http://localhost:3001/rooms')
      .then(res => setRooms(res.data))
      .catch(err => console.error("Failed to load rooms:", err));
  }, []);

  useEffect(() => {
    axios.get('http://localhost:3001/bookings')
      .then(res => setBookings(res.data))
      .catch(err => console.error("Failed to load bookings:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleClassroomChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedClassroom(event.target.value);
  };

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStartTime(event.target.value);
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndTime(event.target.value);
  };

  // ✅ Fixed timezone-aware time formatting
  const formatTime = (t: string) => {
    const [hour, minute] = t.split(":");
    const today = new Date();
    const local = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate(),
      parseInt(hour),
      parseInt(minute),
      0
    );
    return local.toISOString(); // converts to UTC correctly
  };

  const handleReserveRoom = async () => {
    if (!selectedClassroom || !selectedStartTime || !selectedEndTime) {
      alert("Please select a classroom and times before booking!");
      return;
    }

    const [building, roomNumber] = selectedClassroom.split("_");

    try {
      await axios.post(`http://localhost:3001/bookings/${encodeURIComponent(building)}/${encodeURIComponent(roomNumber)}`, {
        startTime: formatTime(selectedStartTime),
        endTime: formatTime(selectedEndTime),
        attendees: 1
      });

      alert("Booking created successfully!");
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking");
    }
  };

  return (
    <div className="Search-group">
      <h2>Book a Room</h2>

      <h3>Classroom: </h3>
      <select value={selectedClassroom} onChange={handleClassroomChange}>
        <option value="">-- Select classroom --</option>
        {rooms.map((room) => (
          <option key={room.roomID} value={`${room.building}_${room.roomNumber}`}>
            {room.building} {room.roomNumber}
          </option>
        ))}
      </select>

      <h3>Start Time:</h3>
      <select value={selectedStartTime} onChange={handleStartTimeChange}>
        <option value="">-- Select start time --</option>
        {times.map((t) => <option key={t}>{t}</option>)}
      </select>

      <h3>End Time:</h3>
      <select value={selectedEndTime} onChange={handleEndTimeChange}>
        <option value="">-- Select end time --</option>
        {times.map((t) => <option key={t}>{t}</option>)}
      </select>

      <br /><br />
      <button className="button" onClick={handleReserveRoom}>
        Reserve Room
      </button>
    </div>
  );
};

export default ClassRoomSearchPage;

//INSERT INTO "user" ("userID", "username", "email", "password")
//VALUES (1, 'testuser', 'test@example.com', 'password');
//docker exec -it db psql -U postgres -d mydb
//\d
//\q