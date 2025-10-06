import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom'

import Dashboard from './pages/Dashboard.tsx';
import SignIn from './pages/SignIn.tsx';
import ClassroomSearchPage from './pages/ClassroomSearchPage.tsx';
import MyBookings from './pages/MyBookings.tsx';
import Admin from './pages/Admin.tsx';
import Registrar from "./pages/Registrar.tsx";

import './styles/Main.css';

const Main: React.FC = () => {
    return (
        <Router>
            <nav className="navBar">
                <Link to="/Dashboard" className="navLink">Dashboard</Link> |{' '}
                {/*<Link to="/SignIn" className="navLink">SignIn</Link> |{' '}*/}
                <Link to="/SearchClassroom" className="navLink">Classroom Search</Link> |{' '}
                <Link to="/MyBookings" className="navLink">My Bookings</Link> |{' '}
                <Link to="/Admin" className="navLink">Admin</Link> |{' '}
                <Link to="/Registrar" className="navLink">Registrar</Link>
            </nav>

            <Routes>
                <Route path="/Dashboard" element={<Dashboard />} />
                {/*<Route path="/SignIn" element={<SignIn />} />*/}
                <Route path="/SearchClassroom" element={<ClassroomSearchPage />} />
                <Route path="/MyBookings" element={<MyBookings />} />
                <Route path="/Admin" element={<Admin />} />
                <Route path="/Registrar" element={<Registrar />} />
            </Routes>
        </Router>
    );
};

export default Main;
