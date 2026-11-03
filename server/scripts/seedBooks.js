import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Book from '../models/Book.js';
import { booksData } from './booksData.js';
import { connectDB } from '../config/db.js';

dotenv.config();

export const seedDatabase = async () => {
  try {
    const existingCount = await Book.countDocuments();
    console.log(`Current book count in database: ${existingCount}`);

    let insertedCount = 0;
    let updatedCount = 0;

    for (const book of booksData) {
      const res = await Book.findOneAndUpdate(
        { title: book.title, author: book.author },
        book,
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
      if (res) {
        insertedCount++;
      }
    }

    const totalCount = await Book.countDocuments();
    console.log(`✓ Database seeding completed successfully! Total books in catalog: ${totalCount}`);
    return totalCount;
  } catch (err) {
    console.error('Error during database seeding:', err.message);
    throw err;
  }
};

// If run directly from terminal: `node scripts/seedBooks.js`
if (process.argv[1] && process.argv[1].endsWith('seedBooks.js')) {
  (async () => {
    try {
      await connectDB();
      await seedDatabase();
      console.log('Seeder script finished. Exiting...');
      process.exit(0);
    } catch (err) {
      console.error('Seeder execution failed:', err);
      process.exit(1);
    }
  })();
}

