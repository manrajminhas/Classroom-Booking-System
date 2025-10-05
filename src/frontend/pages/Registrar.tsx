import React from 'react';
import '../styles/Registrar.css'

const Registrar: React.FC = () => {
    return (
        <div>
            <h2>Classroom Logs</h2>

            <h2>Classroom Statistics</h2>

            <h2>Account Management</h2>
            <input className="Search-bar" type="text" id="SearchBar" placeholder="Search for an Account" />
            <button className="Search-button">Search</button>
            {/*button onclick="search()">Search</button>*/}

            <h2>Classroom Management</h2>
            <input className="Search-bar" type="text" id="SearchBar" placeholder="Search a Classroom" />
            <button className="Search-button">Search</button>
            {/*button onclick="search()">Search</button>*/}

        </div>
    );
};

export default Registrar;