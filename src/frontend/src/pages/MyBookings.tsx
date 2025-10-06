import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../styles/MyBookings.css'

interface Bookings {
    bookingID: number;
    classroomName: string;
    startTime: Date;
    endTime: Date;
}


const MyBookings: React.FC = () => {

    const [loading, setLoading] = useState(true);
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

                <tr>
                    <th className="table-body"></th>
                </tr>
                </tbody>
            </table>

            <h2>Booking History</h2>

            <table className="Previous-bookings-table">
                <thead>
                <tr>
                    <th className="table-header">Booking ID</th>
                    <th className="table-header">Classroom ID</th>
                    <th className="table-header">Classroom Name</th>
                    <th className="table-header">Start Time/Date</th>
                    <th className="table-header">End Time/Date</th>
                </tr>
                </thead>
            </table>

        </div>
    );
};

export default MyBookings;