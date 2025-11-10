import React, { useState } from 'react';
import axios from 'axios';
import '../styles/ClassroomSearchPage.css';

interface Room {
  roomID: number;
  building: string;
  roomNumber: string;
  capacity: number;
}

const API = 'http://localhost:3001';

// Available Time Slots for the dropdowns
const times = [
  "8:00", "8:30", "9:00", "9:30", "10:00", "10:30",
  "11:00", "11:30", "12:00", "12:30", "13:00", "13:30",
  "14:00", "14:30", "15:00", "15:30", "16:00", "16:30",
  "17:00", "17:30", "18:00", "18:30", "19:00", "19:30", "20:00"
];

// Helper function to format date (YYYY-MM-DD) and time (HH:MM) into an ISO string
const formatDateTimeISO = (dateStr: string, timeStr: string): string | null => {
  if (!dateStr || !timeStr) return null;
  const [year, month, day] = dateStr.split('-');
  const [hour, minute] = timeStr.split(':');

  // Month is 0-indexed in JS Date, so we subtract 1
  const localDate = new Date(
    parseInt(year),
    parseInt(month) - 1,
    parseInt(day),
    parseInt(hour),
    parseInt(minute),
    0
  );
  return localDate.toISOString();
};

// Helper to get unique buildings from results
const getUniqueBuildings = (rooms: Room[]): string[] => {
    const buildings = rooms.map(room => room.building);
    return Array.from(new Set(buildings)).sort();
};


const ClassRoomSearchPage: React.FC = () => {
  // Filters
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedStartTime, setSelectedStartTime] = useState<string>('');
  const [selectedEndTime, setSelectedEndTime] = useState<string>('');
  const [minCapacity, setMinCapacity] = useState<number>(1);
  const [buildingFilter, setBuildingFilter] = useState<string>('');

  // Results & Selection
  const [availableRooms, setAvailableRooms] = useState<Room[]>([]);
  const [selectedRoomKey, setSelectedRoomKey] = useState<string>('');
  const [searchMessage, setSearchMessage] = useState<string>('Set filters and click Search for availability.');

  // --- Handlers for User Input ---

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(event.target.value);
    setBuildingFilter(''); // Reset building filter on date change
  };

  const handleStartTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedStartTime(event.target.value);
    setBuildingFilter('');
  };

  const handleEndTimeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedEndTime(event.target.value);
    setBuildingFilter('');
  };

  const handleCapacityChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMinCapacity(parseInt(event.target.value) || 1);
    setBuildingFilter('');
  };
  
  const handleBuildingFilterChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setBuildingFilter(event.target.value);
  };

  const handleRoomSelection = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedRoomKey(event.target.value);
  };

  const handleSearch = async () => {
    if (!selectedDate || !selectedStartTime || !selectedEndTime) {
      setSearchMessage("Please select a date, start time, and end time.");
      setAvailableRooms([]);
      return;
    }
    
    setAvailableRooms([]); // Clear previous results
    setSelectedRoomKey('');
    setSearchMessage('Searching...');
    setBuildingFilter(''); // Always reset building filter before a new API search

    const startTimeISO = formatDateTimeISO(selectedDate, selectedStartTime);
    const endTimeISO = formatDateTimeISO(selectedDate, selectedEndTime);
    
    // Client-side time validation
    if (!startTimeISO || !endTimeISO || startTimeISO >= endTimeISO) {
      setSearchMessage("Invalid time range selected.");
      return;
    }

    try {
      const res = await axios.get(`${API}/bookings/available`, {
        params: {
          start: startTimeISO,
          end: endTimeISO,
          capacity: minCapacity > 1 ? minCapacity : undefined,
        }
      });
      
      const results = res.data as Room[];
      setAvailableRooms(results);

      if (results.length > 0) {
        // Automatically select the first room for booking
        setSelectedRoomKey(`${results[0].building}_${results[0].roomNumber}`);
        setSearchMessage(`Found ${results.length} available room(s). Select one to book.`);
      } else {
        setSearchMessage("No rooms available for the selected slot and capacity.");
      }

    } catch (err: any) {
      console.error("Search failed:", err);
      setSearchMessage(err.response?.data?.message || "Search failed due to a server error.");
    }
  };

  const handleReserveRoom = async () => {
    if (!selectedRoomKey) {
      alert("Please select an available room from the search results first!");
      return;
    }

    const [building, roomNumber] = selectedRoomKey.split("_");

    const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
    if (!currentUser?.username) {
      alert("You must be logged in to book a room!");
      return;
    }

    const startTimeISO = formatDateTimeISO(selectedDate, selectedStartTime);
    const endTimeISO = formatDateTimeISO(selectedDate, selectedEndTime);
    
    if (!startTimeISO || !endTimeISO) {
      alert("Time data is missing. Please run the search again.");
      return;
    }

    try {
      await axios.post(
        `${API}/bookings/${encodeURIComponent(building)}/${encodeURIComponent(roomNumber)}`,
        {
          startTime: startTimeISO,
          endTime: endTimeISO,
          attendees: 1, 
          username: currentUser.username,
        }
      );

      alert(`Booking created successfully for ${building} ${roomNumber}!`);
      // Re-run search after successful booking to update availability
      handleSearch(); 
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || "Failed to create booking. Check if the room is still available.");
    }
  };

  return (
    <div className="Search-group" style={{ maxWidth: '600px', margin: 'auto', padding: '20px' }}>
      <h2>Find & Book a Room</h2>

      <section style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
        <h3>1. Set Availability Filters</h3>
        
        <label>
          Date:
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            style={{ marginRight: 20, padding: 6 }}
          />
        </label>
        
        <div style={{ marginTop: '10px', display: 'flex', gap: '20px' }}>
          <label>
            Start Time:
            <select value={selectedStartTime} onChange={handleStartTimeChange} style={{ marginLeft: 8, padding: 6 }}>
              <option value="">-- Select --</option>
              {times.map((t) => <option key={`start-${t}`}>{t}</option>)}
            </select>
          </label>
          
          <label>
            End Time:
            <select value={selectedEndTime} onChange={handleEndTimeChange} style={{ marginLeft: 8, padding: 6 }}>
              <option value="">-- Select --</option>
              {times.map((t) => <option key={`end-${t}`}>{t}</option>)}
            </select>
          </label>
        </div>

        <div style={{ marginTop: '10px' }}>
           <label>
            Min Capacity:
            <input
              type="number"
              min="1"
              value={minCapacity}
              onChange={handleCapacityChange}
              style={{ marginRight: 20, padding: 6, width: 60 }}
            />
          </label>
        </div>

        <button 
          onClick={handleSearch} 
          style={{ 
            marginTop: '15px', 
            padding: '8px 15px', 
            backgroundColor: '#007bff', 
            color: 'white', 
            border: 'none', 
            borderRadius: 4, 
            cursor: 'pointer' 
          }}
        >
          Search Availability
        </button>
      </section>

      <section>
        <h3>2. Available Rooms</h3>
        <p style={{ fontStyle: 'italic' }}>{searchMessage}</p>

        {availableRooms.length > 0 && (
            <div style={{ marginBottom: '10px' }}>
                <label>
                    Filter Building:
                    <select 
                        value={buildingFilter} 
                        onChange={handleBuildingFilterChange} 
                        style={{ marginLeft: 8, padding: 6 }}
                    >
                        <option value="">All Buildings</option>
                        {getUniqueBuildings(availableRooms).map(b => (
                            <option key={b} value={b}>{b}</option>
                        ))}
                    </select>
                </label>
            </div>
        )}
        
        {availableRooms.length > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '5px' }}>
            <select value={selectedRoomKey} onChange={handleRoomSelection} style={{ padding: 8, flexGrow: 1 }}>
              {availableRooms
                // APPLY FILTER: Filter by building if one is selected
                .filter(room => buildingFilter === '' || room.building === buildingFilter)
                .map((room) => (
                    <option 
                    key={room.roomID} 
                    value={`${room.building}_${room.roomNumber}`}
                    >
                    {`${room.building} ${room.roomNumber} (Capacity: ${room.capacity})`}
                    </option>
                ))}
            </select>

            <button 
              className="button" 
              onClick={handleReserveRoom}
              style={{ padding: '8px 15px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              Book Now
            </button>
          </div>
        )}
      </section>
    </div>
  );
};

export default ClassRoomSearchPage;