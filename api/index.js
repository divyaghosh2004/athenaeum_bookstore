import app from '../server/app.js';
import { connectDB } from '../server/config/db.js';
import Book from '../server/models/Book.js';
import { seedDatabase } from '../server/scripts/seedBooks.js';

let isSeeded = false;

export default async function handler(req, res) {
  try {
    await connectDB();

    if (!isSeeded) {
      try {
        const count = await Book.countDocuments();
        if (count === 0) {
          console.log('Seeding initial 70 books in production...');
          await seedDatabase();
        }
        isSeeded = true;
      } catch (seedErr) {
        console.warn('Auto-seed check note:', seedErr.message);
      }
    }

    return app(req, res);
  } catch (error) {
    console.error('Serverless API execution error:', error);
    return res.status(500).json({
      success: false,
      message: 'Serverless execution error: ' + error.message
    });
  }
}

