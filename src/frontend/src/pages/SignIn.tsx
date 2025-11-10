/**
 * SignIn component
 * 
 * Handles user authentication by sending login credentials
 * to the backend (`/users/login`) and saving the returned
 * access token and user info to localStorage.
 * 
 * Redirects to the dashboard after successful login.
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SignInProps {
  onLogin: () => void;
}

const SignIn: React.FC<SignInProps> = ({ onLogin }) => {
  // -------------------- STATE --------------------
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  /**
   * Handles login submission by sending POST request to backend.
   * On success, stores token + user in localStorage and navigates to HomePage.
   */
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:3001/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) throw new Error('Invalid credentials');

      const data = await response.json();
      const { access_token, user } = data;

      localStorage.setItem('token', access_token);
      localStorage.setItem('user', JSON.stringify(user));

      onLogin();
      navigate('/HomePage');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    }
  };

  // -------------------- RENDER --------------------
  return (
    <div className="signin-container">
      <h1>Sign In</h1>

      <form onSubmit={handleLogin}>
        <div>
          <label>Username:</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>

        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        <button type="submit">Login</button>
      </form>

      {error && <p className="error-message">{error}</p>}
    </div>
  );
};

export default SignIn;