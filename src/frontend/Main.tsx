import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import ClassroomSearchPage from './pages/ClassroomSearchPage';
import MyBookings from './pages/MyBookings';

import './styles/Main.css';

const Main: React.FC = () => {
    return (
        <Router>
            <nav className="navBar">
                <Link to="/Dashboard" className="navLink">Dashboard</Link> |{' '}
                {/*<Link to="/SignIn" className="navLink">SignIn</Link> |{' '}*/}
                <Link to="/SearchClassroom" className="navLink">Classroom Search</Link> |{' '}
                <Link to="/MyBookings" className="navLink">My Bookings</Link>
            </nav>

            <Routes>
                <Route path="/" element={<Dashboard />} />
                {/*<Route path="/SignIn" element={<SignIn />} />*/}
                <Route path="/SearchClassroom" element={<ClassroomSearchPage />} />
                <Route path="/MyBookings" element={<MyBookings />} />
            </Routes>
        </Router>
    );
};

export default Main;