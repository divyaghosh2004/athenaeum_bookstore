import Library from '../models/Library.js';
import Book from '../models/Book.js';

// @desc    Get user's personal digital library
// @route   GET /api/library
// @access  Private
export const getLibrary = async (req, res, next) => {
  try {
    let library = await Library.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author coverImage description category sampleContent downloadUrl digitalFileReference bookType'
    });

    if (!library) {
      library = await Library.create({ user: req.user._id, items: [] });
    }

    // Filter out deleted books
    const validItems = library.items.filter(item => item.book != null);

    res.json({
      success: true,
      count: validItems.length,
      library: {
        ...library.toObject(),
        items: validItems
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update reading progress
// @route   PUT /api/library/:bookId/progress
// @access  Private
export const updateProgress = async (req, res, next) => {
  try {
    const { bookId } = req.params;
    const { readingProgress, lastReadPosition } = req.body;

    let library = await Library.findOne({ user: req.user._id });
    if (!library) {
      return res.status(404).json({ success: false, message: 'Library not found' });
    }

    const itemIndex = library.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (itemIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'This book is not in your personal library.'
      });
    }

    if (readingProgress !== undefined) {
      library.items[itemIndex].readingProgress = Math.min(100, Math.max(0, parseInt(readingProgress) || 0));
    }

    if (lastReadPosition) {
      library.items[itemIndex].lastReadPosition = lastReadPosition;
    }

    library.items[itemIndex].lastReadAt = new Date();

    await library.save();

    res.json({
      success: true,
      message: 'Reading progress updated.',
      item: library.items[itemIndex]
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Claim free book into user's library
// @route   POST /api/library/claim/:bookId
// @access  Private
export const claimFreeBook = async (req, res, next) => {
  try {
    const { bookId } = req.params;

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    if (!book.freeDownloadStatus) {
      return res.status(400).json({
        success: false,
        message: 'Only free public domain books can be directly claimed into your library.'
      });
    }

    let library = await Library.findOne({ user: req.user._id });
    if (!library) {
      library = await Library.create({ user: req.user._id, items: [] });
    }

    const existingIndex = library.items.findIndex(
      item => item.book.toString() === bookId
    );

    if (existingIndex > -1) {
      return res.json({
        success: true,
        message: 'This book is already in your library.',
        item: library.items[existingIndex]
      });
    }

    library.items.push({
      book: book._id,
      accessSource: 'free_claim',
      readingProgress: 0,
      lastReadPosition: 'Chapter 1: The Opening'
    });

    await library.save();

    res.status(201).json({
      success: true,
      message: `"${book.title}" added to your personal library.`,
      library
    });
  } catch (err) {
    next(err);
  }
};

