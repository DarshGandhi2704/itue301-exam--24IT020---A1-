import React, { useState, useEffect } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import EventCard from '../components/EventCard';

const EventsPage = () => {
  // Required main states: events, loading, error
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Client-side search state
  const [searchTerm, setSearchTerm] = useState('');

  // TASK 2 BOOKING FORM states:
  // Use useState for at least two meaningful state values
  const [selectedEventId, setSelectedEventId] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Additional booking feedback states
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState('');
  const [bookingError, setBookingError] = useState('');

  // Function to fetch events from backend
  const fetchEvents = async () => {
    setLoading(true);
    setError(null);
    try {
      // GET /api/v1/events - public endpoint consumed via Axios
      const response = await api.get('/events');
      setEvents(response.data.data || []);
    } catch (err) {
      console.error('Error fetching events:', err);
      setError(err.response?.data?.message || 'Failed to load events from server. Please verify backend is running.');
    } finally {
      setLoading(false);
    }
  };

  // useEffect() triggered on component mount
  useEffect(() => {
    fetchEvents();
  }, []);

  // Client-side search filtering using .filter()
  // Does NOT send another API request when searching
  const filteredEvents = events.filter((ev) =>
    ev.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Auto-select event when user clicks "Book Now" on an EventCard
  const handleSelectEvent = (event) => {
    setSelectedEventId(event._id);
    setBookingSuccess('');
    setBookingError('');
    // Ensure quantity is at least 1
    if (quantity < 1) setQuantity(1);

    // Scroll smoothly to booking form
    const bookingFormEl = document.getElementById('booking-section');
    if (bookingFormEl) {
      bookingFormEl.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Handle ticket booking form submission
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingSuccess('');
    setBookingError('');

    if (!selectedEventId) {
      setBookingError('Please select an event to book tickets.');
      return;
    }

    if (quantity < 1) {
      setBookingError('Booking quantity must be at least 1.');
      return;
    }

    setBookingLoading(true);

    try {
      // POST /api/v1/tickets - protected endpoint
      const response = await api.post('/tickets', {
        eventId: selectedEventId,
        quantity: parseInt(quantity, 10)
      });

      // HTTP 201 successful creation
      const bookedEventTitle = response.data.data?.eventId?.title || 'Selected Event';
      setBookingSuccess(`🎉 Successfully booked ${quantity} ticket(s) for "${bookedEventTitle}"! Check "My Tickets" to view your booking.`);

      // Refresh events so ticketsAvailable decreases dynamically
      await fetchEvents();
    } catch (err) {
      // HTTP 400 or other structured JSON error from backend
      console.error('Booking failed:', err);
      const msg = err.response?.data?.message || 'Failed to book tickets. Please check ticket availability.';
      setBookingError(msg);
    } finally {
      setBookingLoading(false);
    }
  };

  // Find currently selected event object
  const currentSelectedEvent = events.find((ev) => ev._id === selectedEventId);

  return (
    <div className="page-wrapper">
      <Navbar />

      <main className="container">
        {/* Page Header */}
        <section className="page-hero">
          <div className="hero-content">
            <h1>Explore Upcoming Events</h1>
            <p className="hero-subtitle">
              Browse exciting conferences, hackathons, and workshops. Book tickets in real-time.
            </p>
          </div>

          {/* Client-side Search Input */}
          <div className="search-bar-wrapper">
            <div className="search-input-box">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                className="search-input"
                placeholder="Search events by title (client-side filter)..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                id="event-search-input"
              />
              {searchTerm && (
                <button
                  type="button"
                  className="clear-search-btn"
                  onClick={() => setSearchTerm('')}
                  title="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <div className="search-count">
              Showing <strong>{filteredEvents.length}</strong> of <strong>{events.length}</strong> events
            </div>
          </div>
        </section>

        {/* TASK 2 BOOKING FORM */}
        <section className="booking-form-section" id="booking-section">
          <div className="booking-card">
            <div className="booking-card-header">
              <h2>🎟️ Book Event Tickets</h2>
              <p className="booking-card-subtitle">
                Select an event from the list below or from the dropdown, choose your quantity, and reserve your spot.
              </p>
            </div>

            {bookingSuccess && (
              <div className="alert alert-success" id="booking-success-msg">
                {bookingSuccess}
              </div>
            )}

            {bookingError && (
              <div className="alert alert-error" id="booking-error-msg">
                ⚠️ {bookingError}
              </div>
            )}

            <form onSubmit={handleBookingSubmit} className="booking-form-grid">
              {/* Form Input 1: Selected Event */}
              <div className="form-group">
                <label htmlFor="event-select">
                  Selected Event <span className="required-star">*</span>
                </label>
                <select
                  id="event-select"
                  className="form-control"
                  value={selectedEventId}
                  onChange={(e) => {
                    setSelectedEventId(e.target.value);
                    setBookingSuccess('');
                    setBookingError('');
                  }}
                  required
                >
                  <option value="">-- Choose an Event --</option>
                  {events.map((ev) => (
                    <option
                      key={ev._id}
                      value={ev._id}
                      disabled={ev.ticketsAvailable === 0}
                    >
                      {ev.title} {ev.ticketsAvailable === 0 ? '(SOLD OUT)' : `(${ev.ticketsAvailable} tickets left)`}
                    </option>
                  ))}
                </select>
              </div>

              {/* Form Input 2: Quantity */}
              <div className="form-group">
                <label htmlFor="ticket-quantity">
                  Quantity <span className="required-star">*</span>
                </label>
                <input
                  id="ticket-quantity"
                  type="number"
                  min="1"
                  max={currentSelectedEvent ? Math.max(1, currentSelectedEvent.ticketsAvailable) : 50}
                  className="form-control"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <div className="form-group submit-group">
                <button
                  type="submit"
                  className="btn btn-primary btn-submit-booking"
                  disabled={bookingLoading || !selectedEventId || (currentSelectedEvent && currentSelectedEvent.ticketsAvailable === 0)}
                  id="confirm-booking-btn"
                >
                  {bookingLoading ? 'Processing Booking...' : 'Confirm Ticket Booking'}
                </button>
              </div>
            </form>

            {currentSelectedEvent && (
              <div className="selected-event-preview">
                <strong>Selected:</strong> {currentSelectedEvent.title} | <strong>Venue:</strong> {currentSelectedEvent.venue} | <strong>Available:</strong> {currentSelectedEvent.ticketsAvailable} tickets
              </div>
            )}
          </div>
        </section>

        {/* Events Grid Section */}
        <section className="events-list-section">
          <h2>All Available Events</h2>

          {/* While Loading: Display loading indicator */}
          {loading && (
            <div className="loading-state" id="events-loading">
              <div className="spinner"></div>
              <p>Fetching events from server...</p>
            </div>
          )}

          {/* If Request Fails: Display error message */}
          {error && !loading && (
            <div className="alert alert-error" id="events-error">
              <h3>Error Loading Events</h3>
              <p>{error}</p>
              <button type="button" className="btn btn-secondary" onClick={fetchEvents}>
                🔄 Retry Loading
              </button>
            </div>
          )}

          {/* If Successful: Render all events using EventCard */}
          {!loading && !error && filteredEvents.length === 0 && (
            <div className="empty-state">
              <p>No events found matching "{searchTerm}".</p>
            </div>
          )}

          {!loading && !error && filteredEvents.length > 0 && (
            <div className="events-grid" id="events-grid">
              {filteredEvents.map((ev) => (
                <EventCard
                  key={ev._id}
                  title={ev.title}
                  category={ev.category}
                  date={ev.date}
                  venue={ev.venue}
                  ticketsAvailable={ev.ticketsAvailable}
                  isSelected={selectedEventId === ev._id}
                  onBook={() => handleSelectEvent(ev)}
                />
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default EventsPage;
