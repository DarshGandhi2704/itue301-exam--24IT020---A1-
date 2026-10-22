const express = require('express');
const Event = require('../models/Event');
const { authGuard, roleGuard } = require('../middleware/authGuard');

const router = express.Router();

// GET /api/v1/events
// Public endpoint: Return all events
router.get('/', async (req, res, next) => {
  try {
    // Sort events by date ascending
    const events = await Event.find().sort({ date: 1 });
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/events/:id
// Public endpoint: Return single event by ID
router.get('/:id', async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found'
      });
    }
    res.status(200).json({
      success: true,
      data: event
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/v1/events
// Protected endpoint for organizer: Create a new event
router.post('/', authGuard, roleGuard('organizer'), async (req, res, next) => {
  try {
    const { title, category, date, venue, ticketsAvailable } = req.body;
    const newEvent = await Event.create({
      title,
      category,
      date,
      venue,
      ticketsAvailable: Number(ticketsAvailable)
    });

    res.status(201).json({
      success: true,
      message: 'Event created successfully',
      data: newEvent
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
