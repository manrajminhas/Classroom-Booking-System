/**
 * ProtectedRoute component
 * 
 * Wraps around pages that require authentication.
 * Checks if a valid token exists in localStorage — if not, redirects to SignIn.
 */

import React from 'react';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  /** Child component(s) to render when access is allowed */
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const token = localStorage.getItem('token'); // Retrieve saved authentication token

  // Redirect unauthenticated users to the Sign In page
  if (!token) {
    return <Navigate to="/SignIn" replace />;
  }

  // Otherwise, allow access to the protected route
  return <>{children}</>;
};

export default ProtectedRoute;