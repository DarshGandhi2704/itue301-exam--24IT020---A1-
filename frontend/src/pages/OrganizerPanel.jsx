import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';

const OrganizerPanel = () => {
  const { attendee } = useAuth();

  // State for all events and tickets
  const [events, setEvents] = useState([]);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // New Event Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    category: 'Technology',
    date: '',
    venue: '',
    ticketsAvailable: 50
  });
  const [formSuccess, setFormSuccess] = useState('');
  const [formError, setFormError] = useState('');
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch organizer dashboard data
  const loadDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [eventsRes, ticketsRes] = await Promise.all([
        api.get('/events'),
        api.get('/tickets')
      ]);

      setEvents(eventsRes.data.data || []);
      setTickets(ticketsRes.data.data || []);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
      setError(err.response?.data?.message || 'Could not fetch organizer records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Handle Event Creation (POST /api/v1/events)
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    setFormSuccess('');
    setFormError('');

    if (!newEvent.title || !newEvent.date || !newEvent.venue) {
      setFormError('Please fill in Title, Date, and Venue.');
      return;
    }

    setFormSubmitting(true);
    try {
      const response = await api.post('/events', newEvent);
      setFormSuccess(`🎉 Event "${response.data.data.title}" successfully created!`);
      // Reset form
      setNewEvent({
        title: '',
        category: 'Technology',
        date: '',
        venue: '',
        ticketsAvailable: 50
      });
      // Refresh dashboard data
      await loadDashboardData();
    } catch (err) {
      console.error('Error creating event:', err);
      setFormError(err.response?.data?.message || 'Failed to create event.');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Handle Ticket Status Change (PATCH /api/v1/tickets/:id/status)
  const handleUpdateTicketStatus = async (ticketId, nextStatus) => {
    try {
      await api.patch(`/tickets/${ticketId}/status`, { status: nextStatus });
      // Update locally
      setTickets((prev) =>
        prev.map((t) => (t._id === ticketId ? { ...t, status: nextStatus } : t))
      );
    } catch (err) {
      console.error('Error updating status:', err);
      alert(err.response?.data?.message || 'Failed to update ticket status.');
    }
  };

  // Calculate high-level stats
  const totalTicketsBooked = tickets.reduce((acc, t) => acc + (t.quantity || 0), 0);
  const totalAvailableAcrossEvents = events.reduce((acc, e) => acc + (e.ticketsAvailable || 0), 0);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container">
        <section className="page-hero">
          <div className="hero-content">
            <div className="badge-wrapper">
              <span className="badge role-organizer">Organizer Access Only</span>
            </div>
            <h1>Organizer Administration Panel</h1>
            <p className="hero-subtitle">
              Welcome back, <strong>{attendee?.name}</strong>. Create new events, monitor live inventory, and manage attendee tickets.
            </p>
          </div>
        </section>

        {/* Dashboard KPI Stats */}
        <section className="kpi-grid">
          <div className="kpi-card">
            <div className="kpi-icon">📅</div>
            <div className="kpi-info">
              <span className="kpi-number">{events.length}</span>
              <span className="kpi-label">Active Events</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">🎟️</div>
            <div className="kpi-info">
              <span className="kpi-number">{totalTicketsBooked}</span>
              <span className="kpi-label">Total Tickets Sold</span>
            </div>
          </div>

          <div className="kpi-card">
            <div className="kpi-icon">⚡</div>
            <div className="kpi-info">
              <span className="kpi-number">{totalAvailableAcrossEvents}</span>
              <span className="kpi-label">Remaining Tickets</span>
            </div>
          </div>
        </section>

        {/* Create New Event Section */}
        <section className="organizer-section">
          <div className="card form-card">
            <h2>➕ Add New Event</h2>
            <p className="section-desc">Create a new event listing that attendees can discover and book.</p>

            {formSuccess && (
              <div className="alert alert-success">
                {formSuccess}
              </div>
            )}

            {formError && (
              <div className="alert alert-error">
                ⚠️ {formError}
              </div>
            )}

            <form onSubmit={handleCreateEvent} className="organizer-event-form">
              <div className="form-row">
                <div className="form-group flex-2">
                  <label htmlFor="event-title">Event Title *</label>
                  <input
                    id="event-title"
                    type="text"
                    className="form-control"
                    placeholder="e.g. NextGen Web Frameworks Summit"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="event-category">Category</label>
                  <select
                    id="event-category"
                    className="form-control"
                    value={newEvent.category}
                    onChange={(e) => setNewEvent({ ...newEvent, category: e.target.value })}
                  >
                    <option value="Technology">Technology</option>
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Music">Music</option>
                    <option value="Conference">Conference</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group flex-1">
                  <label htmlFor="event-date">Date & Time *</label>
                  <input
                    id="event-date"
                    type="datetime-local"
                    className="form-control"
                    value={newEvent.date}
                    onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group flex-2">
                  <label htmlFor="event-venue">Venue / Location *</label>
                  <input
                    id="event-venue"
                    type="text"
                    className="form-control"
                    placeholder="e.g. Main Auditorium, Block 3"
                    value={newEvent.venue}
                    onChange={(e) => setNewEvent({ ...newEvent, venue: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group flex-1">
                  <label htmlFor="event-tickets">Available Tickets *</label>
                  <input
                    id="event-tickets"
                    type="number"
                    min="0"
                    className="form-control"
                    value={newEvent.ticketsAvailable}
                    onChange={(e) => setNewEvent({ ...newEvent, ticketsAvailable: parseInt(e.target.value, 10) || 0 })}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                disabled={formSubmitting}
                id="create-event-btn"
              >
                {formSubmitting ? 'Publishing...' : 'Create & Publish Event'}
              </button>
            </form>
          </div>
        </section>

        {/* Manage Booked Tickets Table */}
        <section className="organizer-section">
          <div className="card table-card">
            <h2>📋 Attendee Booking Management</h2>
            <p className="section-desc">View all confirmed bookings across all events and update status.</p>

            {loading && (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>Loading attendee tickets...</p>
              </div>
            )}

            {error && !loading && (
              <div className="alert alert-error">
                <p>{error}</p>
              </div>
            )}

            {!loading && tickets.length === 0 && (
              <div className="empty-state">
                <p>No tickets booked yet.</p>
              </div>
            )}

            {!loading && tickets.length > 0 && (
              <div className="table-responsive">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Ticket ID</th>
                      <th>Attendee</th>
                      <th>Event</th>
                      <th>Qty</th>
                      <th>Booking Date</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {tickets.map((t) => (
                      <tr key={t._id}>
                        <td>
                          <code>#{t._id.slice(-6).toUpperCase()}</code>
                        </td>
                        <td>
                          <strong>{t.attendeeId?.name || 'N/A'}</strong>
                          <div className="small-text">{t.attendeeId?.email}</div>
                        </td>
                        <td>
                          <strong>{t.eventId?.title || 'Event Removed'}</strong>
                          <div className="small-text">{t.eventId?.venue}</div>
                        </td>
                        <td>{t.quantity}</td>
                        <td>{new Date(t.bookingDate).toLocaleDateString()}</td>
                        <td>
                          <span className={`status-badge status-${t.status}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <select
                            className="form-control form-control-sm"
                            value={t.status}
                            onChange={(e) => handleUpdateTicketStatus(t._id, e.target.value)}
                          >
                            <option value="booked">booked</option>
                            <option value="used">used</option>
                            <option value="cancelled">cancelled</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default OrganizerPanel;
