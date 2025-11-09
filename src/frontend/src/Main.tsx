import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';

import Dashboard from './pages/Dashboard.tsx';
import SignIn from './pages/SignIn.tsx';
import ClassroomSearchPage from './pages/ClassroomSearchPage.tsx';
import MyBookings from './pages/MyBookings.tsx';
import Admin from './pages/Admin.tsx';
import Registrar from './pages/Registrar.tsx';

import './styles/Main.css';

const Main: React.FC = () => {
  const isAuthenticated = !!localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    <Router>
      <nav className="navBar">
        {!isAuthenticated ? (
          <Link to="/SignIn" className="navLink">Sign In</Link>
        ) : (
          <>
            <Link to="/HomePage" className="navLink">Home Page</Link> |{' '}
            <Link to="/BookClassroom" className="navLink">Book Classroom</Link> |{' '}
            <Link to="/MyBookings" className="navLink">My Bookings</Link> |{' '}
            {user.role === 'admin' && (
              <Link to="/Admin" className="navLink">Admin</Link>
            )}
            {user.role === 'registrar' && (
              <Link to="/Registrar" className="navLink">Registrar</Link>
            )}
            {' | '}
            <a
              href="#"
              onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/SignIn';
              }}
              className="navLink"
            >
              Logout
            </a>
          </>
        )}
      </nav>

      <Routes>
        <Route path="/SignIn" element={<SignIn />} />
        <Route
          path="/HomePage"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/SignIn" replace />}
        />
        <Route
          path="/BookClassroom"
          element={isAuthenticated ? <ClassroomSearchPage /> : <Navigate to="/SignIn" replace />}
        />
        <Route
          path="/MyBookings"
          element={isAuthenticated ? <MyBookings /> : <Navigate to="/SignIn" replace />}
        />
        <Route
          path="/Admin"
          element={
            isAuthenticated && user.role === 'admin' ? (
              <Admin />
            ) : (
              <Navigate to="/SignIn" replace />
            )
          }
        />
        <Route
          path="/Registrar"
          element={
            isAuthenticated && user.role === 'registrar' ? (
              <Registrar />
            ) : (
              <Navigate to="/SignIn" replace />
            )
          }
        />
        <Route path="*" element={<Navigate to="/SignIn" replace />} />
      </Routes>
    </Router>
  );
};

export default Main;