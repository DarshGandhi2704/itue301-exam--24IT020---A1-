const Attendee = require('./models/Attendee');
const Event = require('./models/Event');
const Ticket = require('./models/Ticket');

async function seedDatabase() {
  // Clear existing collections
  await Attendee.deleteMany({});
  await Event.deleteMany({});
  await Ticket.deleteMany({});

  // 1. Seed Attendees (at least 2: attendee & organizer)
  const attendees = await Attendee.create([
    {
      name: 'Rahul Sharma',
      email: 'rahul@eventhub.com',
      phone: '+91 9876543210',
      role: 'attendee',
      password: 'password123'
    },
    {
      name: 'Priya Patel',
      email: 'priya@eventhub.com',
      phone: '+91 9123456789',
      role: 'organizer',
      password: 'password123'
    },
    {
      name: 'Amit Verma',
      email: 'amit@eventhub.com',
      phone: '+91 9988776655',
      role: 'attendee',
      password: 'password123'
    }
  ]);

  // 2. Seed Events (at least 4, with at least one Sold Out event ticketsAvailable = 0)
  const events = await Event.create([
    {
      title: 'TechCon 2026: AI & Web Frameworks',
      category: 'Technology',
      date: new Date('2026-11-15T09:00:00.000Z'),
      venue: 'Auditorium Hall A, Silicon Valley Campus',
      ticketsAvailable: 45
    },
    {
      title: 'Global Hackathon & Developer Summit',
      category: 'Hackathon',
      date: new Date('2026-11-28T10:00:00.000Z'),
      venue: 'Innovation Hub, Innovation Park',
      ticketsAvailable: 20
    },
    {
      title: 'Acoustic Sunset Music Festival',
      category: 'Music',
      date: new Date('2026-12-05T18:00:00.000Z'),
      venue: 'City Amphitheatre, Riverfront',
      ticketsAvailable: 0 // SOLD OUT event to demonstrate examination requirement
    },
    {
      title: 'Full-Stack Web Design Workshop',
      category: 'Workshop',
      date: new Date('2026-12-12T14:00:00.000Z'),
      venue: 'Computer Lab 4, IT Block',
      ticketsAvailable: 15
    }
  ]);

  // 3. Seed Sample Tickets
  const rahul = attendees[0];
  const techEvent = events[0];
  const hackathonEvent = events[1];

  await Ticket.create([
    {
      attendeeId: rahul._id,
      eventId: techEvent._id,
      quantity: 2,
      bookingDate: new Date(),
      status: 'booked'
    },
    {
      attendeeId: rahul._id,
      eventId: hackathonEvent._id,
      quantity: 1,
      bookingDate: new Date(Date.now() - 86400000 * 2),
      status: 'used'
    }
  ]);

  console.log('Database seeded with 3 attendees, 4 events (1 Sold Out), and 2 tickets.');
}

module.exports = seedDatabase;
