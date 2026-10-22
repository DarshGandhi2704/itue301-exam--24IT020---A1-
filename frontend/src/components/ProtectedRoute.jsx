import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ProtectedRoute Component
// Requirements:
// 1. Check whether a token exists.
// 2. If token is missing, redirect to /.
// 3. If a role is required and the logged-in user's role does not match, redirect to /events.
// 4. Do NOT log the user out when the role check fails.
// 5. Keep missing-token and wrong-role redirects clearly different.
const ProtectedRoute = ({ children, requiredRole }) => {
  const { token, role } = useAuth();

  // Condition 1: Missing Token -> Redirect to LoginPage (/)
  if (!token) {
    return <Navigate to="/" replace />;
  }

  // Condition 2: Role Mismatch -> Redirect to EventsPage (/events)
  // Preserves login session (does NOT log user out)
  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/events" replace />;
  }

  // Token valid and role authorized -> Render protected component
  return children;
};

export default ProtectedRoute;
