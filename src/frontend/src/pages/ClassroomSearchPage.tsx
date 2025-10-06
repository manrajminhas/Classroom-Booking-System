import React, {useState, useEffect} from 'react';
import axios from 'axios';
import '../styles/ClassroomSearchPage.css';

interface Classroom {
    roomID: number;
    building: string;
    roomNumber: string;
    capacity: number;
}

const ClassRoomSearchPage: React.FC = () => {

    const [query, setQuery] = useState('');
    const [results, setResults] = useState<Classroom[]>([]);
    const [loading, setLoading] = useState(false);

    const handleSearch = async () => {
        try {
            setLoading(true);
            const response = await axios.get<Classroom[]>('http://localhost:3000/rooms', {
                params: { search: query },
            });
            setResults(response.data);
        } catch (error) {
            console.error('Search failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="Search-group">
            <h2>Book a Room</h2><br /><br />

            <input
                className="Search-bar"
                type="text"
                id="SearchBar"
                placeholder="Search a room"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />

            <button className="Search-button" onClick={handleSearch}>
                Search
            </button>

            {loading && <p>Loading...</p>}

            <ul>
                {results.map((room) => (
                    <li key={room.roomID}>
                        <strong>{room.building}</strong> — {room.roomNumber}
                    </li>
                ))}
            </ul>
        </div>

    );
};

export default ClassRoomSearchPage;