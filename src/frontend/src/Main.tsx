import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';

import Dashboard from './pages/Dashboard';
import SignIn from './pages/SignIn';
import ClassroomSearchPage from './pages/ClassroomSearchPage';
import MyBookings from './pages/MyBookings';
import Admin from './pages/Admin';
import Registrar from './pages/Registrar';

import './styles/Main.css';

const Main: React.FC = () => {
  return (
    <Router>
      <nav className="navBar">
        <Link to="/SignIn" className="navLink">Sign In</Link> |{' '}
        <Link to="/HomePage" className="navLink">Home Page</Link> |{' '}
        <Link to="/BookClassroom" className="navLink">Book Classroom</Link> |{' '}
        <Link to="/MyBookings" className="navLink">My Bookings</Link> |{' '}
        <Link to="/Admin" className="navLink">Admin</Link> |{' '}
        <Link to="/Registrar" className="navLink">Registrar</Link>
      </nav>

      <Routes>
        <Route path="/SignIn" element={<SignIn />} />
        <Route path="/HomePage" element={<Dashboard />} />
        <Route path="/BookClassroom" element={<ClassroomSearchPage />} />
        <Route path="/MyBookings" element={<MyBookings />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/Registrar" element={<Registrar />} />
      </Routes>
    </Router>
  );
};

export default Main;