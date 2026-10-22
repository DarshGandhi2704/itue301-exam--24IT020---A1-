require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

// Import custom middlewares
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const ticketRoutes = require('./routes/ticketRoutes');
const seedDatabase = require('./seedHelper');
const Attendee = require('./models/Attendee');

const app = express();

// 1. CORS Configuration - Allow frontend communication
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// 2. Parse incoming JSON payloads
app.use(express.json());

// 3. Apply requestLogger globally for EVERY incoming request
// Format logged: [METHOD] [PATH] [TIMESTAMP]
app.use(requestLogger);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    dbConnected: mongoose.connection.readyState === 1
  });
});

// 4. API Routes
// Public auth route: POST /api/v1/auth/login
app.use('/api/v1/auth', authRoutes);

// Events routes (GET /api/v1/events is public)
app.use('/api/v1/events', eventRoutes);

// Tickets routes (POST /api/v1/tickets, GET /api/v1/tickets/my, PATCH /api/v1/tickets/:id/status)
app.use('/api/v1/tickets', ticketRoutes);

// 404 Handler for unmatched routes
app.use((req, res, next) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.originalUrl}`
  });
});

// 5. Global Error Handler - MUST BE THE LAST MIDDLEWARE
app.use(errorHandler);

// Database Connection & Server Startup
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';

async function startServer() {
  try {
    console.log(`Connecting to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('MongoDB database connected successfully.');

    // Auto-seed if database has no attendees
    const attendeeCount = await Attendee.countDocuments();
    if (attendeeCount === 0) {
      console.log('No attendees found. Auto-seeding initial examination demo data...');
      await seedDatabase();
    }
  } catch (error) {
    console.log(`External MongoDB not reachable (${error.message}). Attempting embedded MongoDB engine...`);
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'eventhub' }
      });
      const embeddedUri = mongod.getUri();
      await mongoose.connect(embeddedUri);
      console.log(`Embedded MongoDB Server started and connected at: ${embeddedUri}`);

      // Seed embedded database
      await seedDatabase();
    } catch (embeddedErr) {
      console.error('Failed to start embedded MongoDB:', embeddedErr.message);
      console.log('Please start a MongoDB instance or configure MONGO_URI in .env');
    }
  }

  app.listen(PORT, () => {
    console.log(`\n======================================================`);
    console.log(`🚀 EventHub Backend Server is running on port ${PORT}`);
    console.log(`📡 API Base URL: http://localhost:${PORT}/api/v1`);
    console.log(`🩺 Health Check: http://localhost:${PORT}/api/health`);
    console.log(`======================================================\n`);
  });
}

startServer();

module.exports = app;
