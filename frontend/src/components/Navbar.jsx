import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Navbar Component
// Implements React Router navigation without full-page reload
// Links: Events, My Tickets, Organizer Panel, Logout
const Navbar = () => {
  const { attendee, role, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <header className="navbar">
      <div className="navbar-container">
        <NavLink to="/events" className="navbar-brand">
          <span className="brand-icon">🎟️</span>
          <span className="brand-text">EventHub</span>
        </NavLink>

        <nav className="navbar-links">
          <NavLink
            to="/events"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            id="nav-link-events"
          >
            Events
          </NavLink>

          <NavLink
            to="/my-tickets"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            id="nav-link-my-tickets"
          >
            My Tickets
          </NavLink>

          <NavLink
            to="/organizer"
            className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            id="nav-link-organizer"
          >
            Organizer Panel
            {role === 'organizer' && <span className="organizer-badge-small">Admin</span>}
          </NavLink>
        </nav>

        <div className="navbar-user-section">
          {attendee && (
            <div className="user-info">
              <span className="user-name">{attendee.name}</span>
              <span className={`role-badge role-${role}`}>{role}</span>
            </div>
          )}

          <button
            type="button"
            className="btn btn-logout"
            onClick={handleLogout}
            id="nav-logout-btn"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
