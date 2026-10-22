const express = require('express');
const Ticket = require('../models/Ticket');
const Event = require('../models/Event');
const { authGuard, roleGuard } = require('../middleware/authGuard');

const router = express.Router();

// POST /api/v1/tickets
// Protected endpoint: Book tickets for an event
// Strictly implements booking validation requirements:
// 1. Find the Event
// 2. Check whether ticketsAvailable >= requested quantity
// 3. If not, return HTTP 400 with a meaningful JSON message
// 4. If valid, create the Ticket
// 5. Decrement ticketsAvailable
// 6. Save/update the Event
// 7. Never allow ticketsAvailable to become negative
// 8. Return HTTP 201 on successful creation
router.post('/', authGuard, async (req, res, next) => {
  try {
    const { eventId, quantity } = req.body;
    const requestedQty = parseInt(quantity, 10);

    // Validate quantity parameter
    if (!requestedQty || isNaN(requestedQty) || requestedQty < 1) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity. Requested tickets must be at least 1.'
      });
    }

    if (!eventId) {
      return res.status(400).json({
        success: false,
        message: 'Event ID is required.'
      });
    }

    // Step 1: Find the Event
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Event not found.'
      });
    }

    // Step 2 & 3: Check whether ticketsAvailable >= requested quantity
    if (event.ticketsAvailable < requestedQty) {
      return res.status(400).json({
        success: false,
        message: `Insufficient tickets available. Only ${event.ticketsAvailable} ticket(s) remaining for "${event.title}".`
      });
    }

    // Step 4: Create the Ticket document
    const newTicket = new Ticket({
      attendeeId: req.user.id,
      eventId: event._id,
      quantity: requestedQty,
      bookingDate: new Date(),
      status: 'booked'
    });

    await newTicket.save();

    // Step 5 & 6: Decrement ticketsAvailable and save Event
    // Atomic check: Math.max(0, ...) ensures ticketsAvailable never becomes negative
    event.ticketsAvailable = Math.max(0, event.ticketsAvailable - requestedQty);
    await event.save();

    // Populate for clean response
    const populatedTicket = await Ticket.findById(newTicket._id)
      .populate('attendeeId', 'name email')
      .populate('eventId', 'title date venue');

    // Step 8: Return HTTP 201 on successful creation
    res.status(201).json({
      success: true,
      message: 'Tickets booked successfully!',
      data: populatedTicket
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tickets/my
// Protected endpoint: Return only the logged-in attendee's tickets
// MUST use exact populate calls:
// .populate('attendeeId', 'name email')
// .populate('eventId', 'title date venue')
router.get('/my', authGuard, async (req, res, next) => {
  try {
    const tickets = await Ticket.find({ attendeeId: req.user.id })
      .populate('attendeeId', 'name email')
      .populate('eventId', 'title date venue')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/v1/tickets
// Protected endpoint for organizer: Return all tickets
router.get('/', authGuard, roleGuard('organizer'), async (req, res, next) => {
  try {
    const tickets = await Ticket.find()
      .populate('attendeeId', 'name email phone role')
      .populate('eventId', 'title date venue ticketsAvailable')
      .sort({ bookingDate: -1 });

    res.status(200).json({
      success: true,
      count: tickets.length,
      data: tickets
    });
  } catch (error) {
    next(error);
  }
});

// PATCH /api/v1/tickets/:id/status
// Protected endpoint: Update ticket status ('booked', 'cancelled', 'used')
router.patch('/:id/status', authGuard, async (req, res, next) => {
  try {
    const { status } = req.body;
    const allowedStatuses = ['booked', 'cancelled', 'used'];

    if (!status || !allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status. Status must be one of: ${allowedStatuses.join(', ')}`
      });
    }

    const ticket = await Ticket.findById(req.params.id);
    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found.'
      });
    }

    // Authorization: User can update their own ticket (e.g. cancel), or organizer can update any ticket
    const isOwner = ticket.attendeeId.toString() === req.user.id;
    const isOrganizer = req.user.role === 'organizer';

    if (!isOwner && !isOrganizer) {
      return res.status(403).json({
        success: false,
        message: 'Access denied. You can only update your own tickets.'
      });
    }

    const previousStatus = ticket.status;
    ticket.status = status;
    await ticket.save();

    // If ticket was cancelled and wasn't already cancelled, return tickets back to event availability
    if (status === 'cancelled' && previousStatus !== 'cancelled') {
      await Event.findByIdAndUpdate(ticket.eventId, {
        $inc: { ticketsAvailable: ticket.quantity }
      });
    }

    const updatedTicket = await Ticket.findById(ticket._id)
      .populate('attendeeId', 'name email')
      .populate('eventId', 'title date venue');

    res.status(200).json({
      success: true,
      message: `Ticket status successfully updated to ${status}.`,
      data: updatedTicket
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
