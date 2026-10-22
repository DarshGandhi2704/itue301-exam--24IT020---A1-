import React from 'react';

// EventCard Component
// Accepts props: title, category, date, venue, ticketsAvailable
// Strictly implements:
// - Display all five values
// - If ticketsAvailable === 0: Display "Sold Out" badge, do NOT display Book button
// - Otherwise: Display Book button
const EventCard = ({
  title,
  category,
  date,
  venue,
  ticketsAvailable,
  onBook,
  isSelected
}) => {
  // Format readable date
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Date TBA';

  const isSoldOut = ticketsAvailable === 0;

  return (
    <div className={`event-card ${isSelected ? 'selected' : ''} ${isSoldOut ? 'sold-out' : ''}`}>
      <div className="event-card-header">
        <span className="event-category-badge">{category || 'General'}</span>
        {isSoldOut ? (
          <span className="badge sold-out-badge" id={`sold-out-${title.toLowerCase().replace(/\s+/g, '-')}`}>
            Sold Out
          </span>
        ) : (
          <span className="badge available-badge">
            {ticketsAvailable} Available
          </span>
        )}
      </div>

      <h3 className="event-card-title">{title}</h3>

      <div className="event-card-details">
        <div className="event-detail-item">
          <span className="detail-icon">📅</span>
          <span className="detail-text">{formattedDate}</span>
        </div>

        <div className="event-detail-item">
          <span className="detail-icon">📍</span>
          <span className="detail-text">{venue}</span>
        </div>

        <div className="event-detail-item">
          <span className="detail-icon">🎟️</span>
          <span className="detail-text">
            <strong>Tickets Available:</strong> {ticketsAvailable}
          </span>
        </div>
      </div>

      <div className="event-card-actions">
        {isSoldOut ? (
          // Strictly per exam requirement: If ticketsAvailable === 0, do NOT display Book button
          <div className="sold-out-notice">
            ❌ Booking Closed (Sold Out)
          </div>
        ) : (
          // Strictly per exam requirement: Otherwise, display Book button
          <button
            type="button"
            className="btn btn-book"
            onClick={onBook}
            id={`book-btn-${title.toLowerCase().replace(/\s+/g, '-')}`}
          >
            Book Now
          </button>
        )}
      </div>
    </div>
  );
};

export default EventCard;
