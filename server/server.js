import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import { connectDB } from './config/db.js';
import Book from './models/Book.js';
import { seedDatabase } from './scripts/seedBooks.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Connect to database
    await connectDB();

    // Auto-seed if book collection is fresh/empty
    const bookCount = await Book.countDocuments();
    if (bookCount === 0) {
      console.log('Book database is empty. Auto-seeding initial 70 curated books...');
      await seedDatabase();
    } else {
      console.log(`Database ready with ${bookCount} books in collection.`);
    }

    const server = app.listen(PORT, () => {
      console.log(`=======================================================`);
      console.log(`  ATHENAEUM BOOKSTORE API SERVER RUNNING ON PORT ${PORT}`);
      console.log(`  Health Check: http://localhost:${PORT}/api/health`);
      console.log(`  Books API:    http://localhost:${PORT}/api/books`);
      console.log(`=======================================================`);
    });

    return server;
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

