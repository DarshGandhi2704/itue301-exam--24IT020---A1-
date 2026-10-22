import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

// Create AuthContext
export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // State: attendee, token, role as required by examination
  const [attendee, setAttendee] = useState(() => {
    const savedAttendee = localStorage.getItem('eventhub_attendee');
    return savedAttendee ? JSON.parse(savedAttendee) : null;
  });

  const [token, setToken] = useState(() => {
    return localStorage.getItem('eventhub_token') || null;
  });

  const [role, setRole] = useState(() => {
    return localStorage.getItem('eventhub_role') || null;
  });

  const [loading, setLoading] = useState(false);

  // Synchronize localStorage when token, attendee, or role changes
  useEffect(() => {
    if (token) {
      localStorage.setItem('eventhub_token', token);
    } else {
      localStorage.removeItem('eventhub_token');
    }

    if (attendee) {
      localStorage.setItem('eventhub_attendee', JSON.stringify(attendee));
    } else {
      localStorage.removeItem('eventhub_attendee');
    }

    if (role) {
      localStorage.setItem('eventhub_role', role);
    } else {
      localStorage.removeItem('eventhub_role');
    }
  }, [token, attendee, role]);

  // Login function
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: receivedToken, attendee: receivedAttendee, role: receivedRole } = response.data;

      setToken(receivedToken);
      setAttendee(receivedAttendee);
      setRole(receivedRole);

      return { success: true, role: receivedRole, attendee: receivedAttendee };
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed. Please check credentials.';
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  };

  // Logout function
  const logout = () => {
    setToken(null);
    setAttendee(null);
    setRole(null);
    localStorage.removeItem('eventhub_token');
    localStorage.removeItem('eventhub_attendee');
    localStorage.removeItem('eventhub_role');
  };

  return (
    <AuthContext.Provider
      value={{
        attendee,
        token,
        role,
        login,
        logout,
        loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for convenient consumption
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
