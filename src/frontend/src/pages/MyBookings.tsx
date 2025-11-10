import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MyBookings.css';

interface Booking {
  bookingID: number;
  startTime: string;
  endTime: string;
  room: {
    building: string;
    roomNumber: string;
  };
}

const API_URL = 'http://localhost:3001';

const MyBookings: React.FC = () => {
  const [upcomingBookings, setUpcomingBookings] = useState<Booking[]>([]);
  const [pastBookings, setPastBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatDisplayDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  const fetchBookings = async () => {
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      setError('User not found. Please log in again.');
      setLoading(false);
      return;
    }

    const user = JSON.parse(storedUser);
    const username = user?.username;

    if (!username) {
      setError('Invalid user data. Please log in again.');
      setLoading(false);
      return;
    }

    try {
      const [futureRes, pastRes] = await Promise.all([
        axios.get(`${API_URL}/bookings/user/${username}/future`),
        axios.get(`${API_URL}/bookings/user/${username}/past`),
      ]);

      setUpcomingBookings(futureRes.data);
      setPastBookings(pastRes.data);
    } catch (err) {
      console.error('Failed to fetch bookings:', err);
      setError('Failed to load bookings. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  const handleCancel = async (bookingID: number) => {
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    const storedUser = localStorage.getItem('user');
    const user = storedUser ? JSON.parse(storedUser) : {};
    const username = user?.username;

    try {
      await axios.delete(`${API_URL}/bookings/${bookingID}`, {
        data: { username }
      });
      
      setUpcomingBookings((prev) =>
        prev.filter((b) => b.bookingID !== bookingID)
      );
      alert('Booking cancelled successfully.');
    } catch (err) {
      console.error('Failed to cancel booking:', err);
      alert('Failed to cancel booking.');
    }
  };

  if (loading) {
    return <div>Loading your bookings...</div>;
  }

  if (error) {
    return <div style={{ color: 'red' }}>{error}</div>;
  }

  return (
    <div>
      <h2>Upcoming Bookings</h2>
      <table className="Current-bookings-table">
        <thead>
          <tr>
            <th className="table-header">Booking ID</th>
            <th className="table-header">Classroom Name</th>
            <th className="table-header">Start Time/Date</th>
            <th className="table-header">End Time/Date</th>
            <th className="table-header">Cancel Booking</th>
          </tr>
        </thead>
        <tbody>
          {upcomingBookings.length > 0 ? (
            upcomingBookings.map((booking) => (
              <tr key={booking.bookingID}>
                <td className="table-body">{booking.bookingID}</td>
                <td className="table-body">
                  {booking.room.building} {booking.room.roomNumber}
                </td>
                <td className="table-body">{formatDisplayDate(booking.startTime)}</td>
                <td className="table-body">{formatDisplayDate(booking.endTime)}</td>
                <td className="table-body">
                  <button
                    className="cancel-button"
                    onClick={() => handleCancel(booking.bookingID)}
                  >
                    Cancel
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} style={{ textAlign: 'center', padding: '1rem' }}>
                No upcoming bookings.
              </td>
            </tr>
          )}
        </tbody>
      </table>

      <h2>Booking History</h2>
      <table className="Previous-bookings-table">
        <thead>
          <tr>
            <th className="table-header">Booking ID</th>
            <th className="table-header">Classroom Name</th>
            <th className="table-header">Start Time/Date</th>
            <th className="table-header">End Time/Date</th>
          </tr>
        </thead>
        <tbody>
          {pastBookings.length > 0 ? (
            pastBookings.map((booking) => (
              <tr key={booking.bookingID}>
                <td className="table-body">{booking.bookingID}</td>
                <td className="table-body">
                  {booking.room.building} {booking.room.roomNumber}
                </td>
                <td className="table-body">{formatDisplayDate(booking.startTime)}</td>
                <td className="table-body">{formatDisplayDate(booking.endTime)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} style={{ textAlign: 'center', padding: '1rem' }}>
                No past bookings.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default MyBookings;