import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ClassroomSearchPage.css';

interface Room {
    roomID: number;
    building: string;
    roomNumber: string;
    capacity: number;
}

const ClassRoomSearchPage: React.FC = () => {
    const [rooms, setRooms] = useState<Room[]>([]);
    const [selectedClassroom, setSelectedClassroom] = useState<string>('');
    const [selectedStartTime, setSelectedStartTime] = useState<string>('');
    const [selectedEndTime, setSelectedEndTime] = useState<string>('');

    const times = [
        "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
        "11:00", "11:30", "12:00", "12:30", "1:00", "1:30",
        "2:00", "2:30", "3:00", "3:30", "4:00", "4:30",
        "5:00", "5:30", "6:00", "6:30", "7:00", "7:30", "8:00"
    ];

    useEffect(() => {
        axios.get<Room[]>('http://localhost:3001/rooms')
            .then(res => setRooms(res.data))
            .catch(err => console.error('Failed to fetch rooms:', err))
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
                {times.map((times) => (
                    <option key={times} value={times}>
                        {times}
                    </option>
                ))}
            </select>

            <h3>End Time:</h3>
            <select value={selectedEndTime} onChange={handleEndTimeChange}>
                <option value="">-- Select end time --</option>
                {times.map((times) => (
                    <option key={times} value={times}>
                        {times}
                    </option>
                ))}
            </select>

            <br/><br/>
            <button className="button">Reserve Room</button>
        </div>
    );
};

export default ClassRoomSearchPage;
