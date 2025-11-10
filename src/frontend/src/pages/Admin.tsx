/**
 * AdminPage component
 * 
 * An administrator dashboard.
 * Displays backend system health (polling every 5 seconds)
 * and a complete audit log of user/system actions.
 */

import React, { useEffect, useState } from 'react';
import axios from 'axios';

/** Type representing a single audit log entry */
interface Log {
  id: number;
  action: string;
  actorUsername: string | null;
  targetType: string | null;
  targetId: string | null;
  createdAt: string;
  details: string | null;
  after?: {
    startTime?: string;
    endTime?: string;
  };
}

/** Type representing backend health check response */
interface Health {
  status: string;
  uptime: number;
  timestamp: string;
}

 /** Stores all audit logs, health fetched from the backend */
const AdminPage: React.FC = () => {
  const [logs, setLogs] = useState<Log[]>([]);
  const [health, setHealth] = useState<Health | null>(null);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch audit logs once when the component first mounts.
   * Shows recorded actions performed in the system.
   */
  useEffect(() => {
    axios
      .get('http://localhost:3001/logs')
      .then(res => setLogs(res.data))
      .catch(err => console.error('Failed to load logs', err));
  }, []);

  /**
   * Fetch current backend health information.
   * Called both on mount and periodically by a polling interval.
   */
  const fetchHealth = async () => {
    try {
      const res = await axios.get('http://localhost:3001/health');
      setHealth(res.data);
      setError(null);
    } catch {
      setHealth(null);
      setError('Backend unreachable');
    }
  };

  /**
   * Polls backend health every 5 seconds to provide live status updates.
   * Automatically stops polling when component unmounts.
   */
  useEffect(() => {
    fetchHealth(); 
    const interval = setInterval(fetchHealth, 5000); 
    return () => clearInterval(interval); 
  }, []);

  /**
   * Converts ISO timestamp into HH:MM.
   * Returns a dash if no time value is provided.
   */
  const formatTime = (t?: string) => {
    if (!t) return '—';
    return new Date(t).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div style={{ padding: '2rem', fontFamily: 'Arial, sans-serif' }}>
      <h1>Admin Dashboard</h1>

      {/*  System Health  */}
      <section
        style={{
          background: '#f9f9f9',
          borderRadius: '8px',
          padding: '1rem',
          marginBottom: '2rem',
          boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
        }}
      >
        <h2>System Health</h2>
        {error ? (
          <p style={{ color: 'red', fontWeight: 'bold' }}>{error}</p>
        ) : health ? (
          <p style={{ color: 'green', lineHeight: '1.5em' }}>
            Status: <b>{health.status.toUpperCase()}</b>
            <br />
            Uptime: {health.uptime.toFixed(1)} seconds
            <br />
            Last Checked: {new Date(health.timestamp).toLocaleString()}
          </p>
        ) : (
          <p>Loading...</p>
        )}
      </section>

      {/*  Audit Log  */}
      <section>
        <h2>Audit Log</h2>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginTop: '1rem',
          }}
        >
          <thead>
            <tr style={{ backgroundColor: '#efefef', textAlign: 'left' }}>
              <th style={{ padding: '8px' }}>Time (Log)</th>
              <th style={{ padding: '8px' }}>Actor</th>
              <th style={{ padding: '8px' }}>Action</th>
              <th style={{ padding: '8px' }}>Target</th>
              <th style={{ padding: '8px' }}>Start Time</th>
              <th style={{ padding: '8px' }}>End Time</th>
              <th style={{ padding: '8px' }}>Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  style={{
                    padding: '1rem',
                    textAlign: 'center',
                    color: '#888',
                  }}
                >
                  No logs available
                </td>
              </tr>
            ) : (
              logs.map(log => (
                <tr key={log.id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '8px' }}>
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {log.actorUsername || 'System'}
                  </td>
                  <td style={{ padding: '8px' }}>{log.action}</td>
                  <td style={{ padding: '8px' }}>
                    {log.targetType} {log.targetId}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {formatTime(log.after?.startTime)}
                  </td>
                  <td style={{ padding: '8px' }}>
                    {formatTime(log.after?.endTime)}
                  </td>
                  <td style={{ padding: '8px' }}>{log.details || '-'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
};

export default AdminPage;