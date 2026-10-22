const mongoose = require('mongoose');

// Event Schema as per examination requirements
const eventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true
  },
  category: {
    type: String,
    trim: true,
    default: 'General'
  },
  date: {
    type: Date,
    required: [true, 'Event date is required']
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true
  },
  ticketsAvailable: {
    type: Number,
    required: [true, 'Tickets available count is required'],
    min: [0, 'Tickets available cannot be negative'],
    default: 0
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Event', eventSchema);
