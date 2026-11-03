import mongoose from 'mongoose';

let mongoMemoryServer = null;

export const connectDB = async () => {
  // Return cached connection in serverless environment
  if (mongoose.connection.readyState >= 1) {
    return mongoose.connection;
  }

  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/online_bookstore';

  try {
    const maskedUri = uri.includes('@') ? uri.replace(/\/\/.*@/, '//*credentials*@') : uri;
    console.log(`Connecting to MongoDB at: ${maskedUri}...`);
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000
    });
    console.log('✓ Successfully connected to MongoDB Server.');
    return mongoose.connection;
  } catch (err) {
    // If running in cloud hosting (Render, Vercel, Netlify) or production, do not attempt to download embedded binary
    if (process.env.RENDER || process.env.VERCEL || process.env.NETLIFY || process.env.NODE_ENV === 'production') {
      console.error('Fatal: Cannot connect to MongoDB Atlas in production:', err.message);
      throw err;
    }

    console.warn(`! Standard MongoDB connection failed (${err.message}).`);
    console.log('⚡ Initializing standalone embedded MongoDB engine for local execution...');
    try {
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      if (!mongoMemoryServer) {
        mongoMemoryServer = await MongoMemoryServer.create();
      }
      const inMemoryUri = mongoMemoryServer.getUri();
      await mongoose.connect(inMemoryUri);
      console.log(`✓ Embedded MongoDB engine active and connected at: ${inMemoryUri}`);
      return mongoose.connection;
    } catch (memErr) {
      console.error('Fatal: Could not connect to any MongoDB instance:', memErr.message);
      throw memErr;
    }
  }
};

// Graceful shutdown in non-serverless mode
if (!process.env.VERCEL && !process.env.NETLIFY) {
  process.on('SIGINT', async () => {
    await mongoose.disconnect();
    if (mongoMemoryServer) {
      await mongoMemoryServer.stop();
    }
    process.exit(0);
  });
}
