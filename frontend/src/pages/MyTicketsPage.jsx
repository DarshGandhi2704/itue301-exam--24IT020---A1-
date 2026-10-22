import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const MyTicketsPage = () => {
  const { attendee } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionMessage, setActionMessage] = useState('');

  // Fetch logged-in user's tickets
  const fetchMyTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/v1/tickets/my - protected endpoint
      // Populates attendeeId (name, email) and eventId (title, date, venue)
      const response = await api.get('/tickets/my');
      setTickets(response.data.data || []);
    } catch (err) {
      console.error('Error fetching tickets:', err);
      setError(err.response?.data?.message || 'Failed to load your tickets.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTickets();
  }, []);

  // Update ticket status (e.g. cancel booking) via PATCH /api/v1/tickets/:id/status
  const handleCancelTicket = async (ticketId) => {
    if (!window.confirm('Are you sure you want to cancel this ticket booking?')) {
      return;
    }

    try {
      const response = await api.patch(`/tickets/${ticketId}/status`, {
        status: 'cancelled'
      });

      setActionMessage(response.data.message || 'Ticket cancelled successfully.');

      // Update state locally
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: 'cancelled' } : t))
      );
    } catch (err) {
      console.error('Error cancelling ticket:', err);
      alert(err.response?.data?.message || 'Failed to cancel ticket.');
    }
  };

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container">
        <section className="page-hero">
          <div className="hero-content">
            <h1>My Booked Tickets</h1>
            <p className="hero-subtitle">
              Manage your event passes, check status, or cancel reservations for {attendee?.name || 'Attendee'}.
            </p>
          </div>
        </section>

        {actionMessage && (
          <div className="alert alert-success" id="ticket-action-msg">
            ✅ {actionMessage}
          </div>
        )}

        {/* Loading Indicator */}
        {loading && (
          <div className="loading-state" id="tickets-loading">
            <div className="spinner"></div>
            <p>Loading your booked tickets...</p>
          </div>
        )}

        {/* Error message */}
        {error && !loading && (
          <div className="alert alert-error" id="tickets-error">
            <h3>Error Loading Tickets</h3>
            <p>{error}</p>
            <button type="button" className="btn btn-secondary" onClick={fetchMyTickets}>
              🔄 Try Again
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && tickets.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h3>No Tickets Found</h3>
            <p>You haven't booked any event tickets yet.</p>
            <a href="/events" className="btn btn-primary">
              Browse Events Now
            </a>
          </div>
        )}

        {/* Tickets Grid */}
        {!loading && !error && tickets.length > 0 && (
          <div className="tickets-grid" id="my-tickets-list">
            {tickets.map((ticket) => {
              const event = ticket.eventId || {};
              const user = ticket.attendeeId || {};

              const eventDateStr = event.date
                ? new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })
                : 'TBA';

              const bookingDateStr = ticket.bookingDate
                ? new Date(ticket.bookingDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })
                : 'N/A';

              return (
                <div key={ticket._id} className="ticket-card" id={`ticket-${ticket._id}`}>
                  <div className="ticket-header">
                    <div>
                      <span className="ticket-id-tag">TICKET #{ticket._id.slice(-6).toUpperCase()}</span>
                      <h3 className="ticket-title">{event.title || 'Event Details Unavailable'}</h3>
                    </div>
                    <span className={`status-badge status-${ticket.status}`}>
                      {ticket.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="ticket-body">
                    <div className="ticket-info-row">
                      <span className="label">📍 Venue:</span>
                      <span className="value">{event.venue || 'TBA'}</span>
                    </div>

                    <div className="ticket-info-row">
                      <span className="label">📅 Event Date:</span>
                      <span className="value">{eventDateStr}</span>
                    </div>

                    <div className="ticket-info-row">
                      <span className="label">👤 Attendee:</span>
                      <span className="value">{user.name} ({user.email})</span>
                    </div>

                    <div className="ticket-info-row">
                      <span className="label">🎟️ Quantity:</span>
                      <span className="value"><strong>{ticket.quantity} ticket(s)</strong></span>
                    </div>

                    <div className="ticket-info-row">
                      <span className="label">🕒 Booked On:</span>
                      <span className="value">{bookingDateStr}</span>
                    </div>
                  </div>

                  <div className="ticket-footer">
                    {ticket.status === 'booked' && (
                      <button
                        type="button"
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelTicket(ticket._id)}
                      >
                        Cancel Ticket
                      </button>
                    )}
                    {ticket.status === 'cancelled' && (
                      <span className="cancelled-note">Reservation cancelled</span>
                    )}
                    {ticket.status === 'used' && (
                      <span className="used-note">Checked in & verified</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
};

export default MyTicketsPage;
