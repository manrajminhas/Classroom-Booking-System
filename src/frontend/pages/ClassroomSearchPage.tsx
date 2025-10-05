import React from 'react';
import '../styles/ClassroomSearchPage.css';

const ClassRoomSearchPage: React.FC = () => {
    return (
        <div className="Search-group">
            <h2>Book a Room</h2><br /><br />

            <input className="Search-bar" type="text" id="SearchBar" placeholder="Search a room" />
                <button className="Search-button">Search Placeholder</button>
                {/*button onclick="search()">Search</button>*/}
        </div>
    );
};

export default ClassRoomSearchPage;