/**
 * Dashboard component
 * 
 * A simple landing page introducing the Classroom Booking System.
 * Displays a brief description for university staff users.
 */

import React from 'react';
import '../styles/Dashboard.css';

const Dashboard: React.FC = () => {
  return (
    <div style={{ padding: '20px' }}>
      <h2>Classroom Booking System</h2>
      <p>
        This webpage allows university staff to reserve classrooms for specific hours.
      </p>
    </div>
  );
};

export default Dashboard;