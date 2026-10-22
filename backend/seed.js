require('dotenv').config();
const mongoose = require('mongoose');
const seedDatabase = require('./seedHelper');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eventhub';

async function runSeed() {
  try {
    console.log(`Attempting to connect to MongoDB at: ${MONGO_URI}`);
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 3000 });
    console.log('Connected to MongoDB successfully.');
    await seedDatabase();
    console.log('Seeding finished successfully.');
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.log('Could not connect to external MongoDB. Checking for embedded MongoDB support...');
    try {
      const { MongoMemoryServer } = require('mongodb-memory-server');
      const mongod = await MongoMemoryServer.create({
        instance: { port: 27017, dbName: 'eventhub' }
      });
      await mongoose.connect(mongod.getUri());
      console.log(`Connected to Embedded MongoDB at: ${mongod.getUri()}`);
      await seedDatabase();
      console.log('Seeding finished successfully in Embedded MongoDB.');
      await mongoose.connection.close();
      await mongod.stop();
      process.exit(0);
    } catch (innerError) {
      console.error('Error seeding database:', error.message);
      process.exit(1);
    }
  }
}

runSeed();
