import Book from '../models/Book.js';
import { generateBookPDF, generateBookEPUB } from '../utils/ebookGenerator.js';

// @desc    Get all books with search, filter, and sorting
// @route   GET /api/books
// @access  Public
export const getBooks = async (req, res, next) => {
  try {
    const { search, category, sort, collection, limit, page } = req.query;

    const query = {};

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Curated collection filter
    if (collection) {
      if (collection === 'featured') query.isFeatured = true;
      if (collection === 'bestseller') query.isBestseller = true;
      if (collection === 'new-arrival') query.isNewArrival = true;
      if (collection === 'recommended') query.isRecommended = true;
    }

    // Search filter across title, author, and category
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // Sorting
    let sortOptions = { createdAt: -1 }; // default newest
    if (sort === 'price-asc') {
      sortOptions = { price: 1 };
    } else if (sort === 'price-desc') {
      sortOptions = { price: -1 };
    } else if (sort === 'popularity') {
      sortOptions = { rating: -1, reviewsCount: -1 };
    } else if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    }

    const pageSize = parseInt(limit) || 100;
    const currentPage = parseInt(page) || 1;
    const skip = (currentPage - 1) * pageSize;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query)
      .sort(sortOptions)
      .skip(skip)
      .limit(pageSize);

    res.json({
      success: true,
      count: books.length,
      total,
      page: currentPage,
      totalPages: Math.ceil(total / pageSize),
      books
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get homepage sections (Featured, Bestsellers, New Arrivals, Recommended)
// @route   GET /api/books/sections
// @access  Public
export const getHomeSections = async (req, res, next) => {
  try {
    const [featured, bestsellers, newArrivals, recommended] = await Promise.all([
      Book.find({ isFeatured: true }).limit(8),
      Book.find({ isBestseller: true }).limit(8),
      Book.find({ isNewArrival: true }).sort({ createdAt: -1 }).limit(8),
      Book.find({ isRecommended: true }).limit(8)
    ]);

    res.json({
      success: true,
      sections: {
        featured,
        bestsellers,
        newArrivals,
        recommended
      }
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single book by ID
// @route   GET /api/books/:id
// @access  Public
export const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    // Also find related books in same category
    const related = await Book.find({
      category: book.category,
      _id: { $ne: book._id }
    }).limit(4);

    res.json({
      success: true,
      book,
      related
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get category counts
// @route   GET /api/books/categories
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = [
      'Fiction',
      'Mystery',
      'Romance',
      'Self-Help',
      'Technology',
      'Business',
      'Education'
    ];

    const counts = await Book.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);

    const countMap = counts.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {});

    const result = categories.map(name => ({
      name,
      count: countMap[name] || 0
    }));

    res.json({
      success: true,
      categories: result
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get free public domain downloadable books
// @route   GET /api/books/free
// @access  Public
export const getFreeBooks = async (req, res, next) => {
  try {
    const freeBooks = await Book.find({ freeDownloadStatus: true }).sort({ rating: -1 });

    res.json({
      success: true,
      count: freeBooks.length,
      books: freeBooks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all E-Books with search, category filtering, and sorting
// @route   GET /api/books/ebooks
// @access  Public
export const getEbooks = async (req, res, next) => {
  try {
    const { search, category, sort } = req.query;

    const query = {};

    // Filter by Category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Search query across title, author, category, description
    if (search && search.trim() !== '') {
      const searchRegex = new RegExp(search.trim(), 'i');
      query.$or = [
        { title: searchRegex },
        { author: searchRegex },
        { category: searchRegex },
        { description: searchRegex }
      ];
    }

    // Sorting
    let sortOptions = { rating: -1, reviewsCount: -1 }; // default popularity
    if (sort === 'newest') {
      sortOptions = { createdAt: -1 };
    } else if (sort === 'title') {
      sortOptions = { title: 1 };
    } else if (sort === 'rating') {
      sortOptions = { rating: -1 };
    }

    const books = await Book.find(query).sort(sortOptions);

    // Dynamic metadata for each e-book
    const formattedEbooks = books.map((book) => {
      const sizeMb = (1.8 + (Math.abs(book.title.length * 7) % 35) / 10).toFixed(1);
      return {
        ...book.toObject(),
        ebookFormats: ['PDF', 'EPUB'],
        fileSize: `${sizeMb} MB`,
        downloadCount: Math.abs(book.reviewsCount * 4 + 320),
        isDigitalAvailable: true
      };
    });

    res.json({
      success: true,
      count: formattedEbooks.length,
      ebooks: formattedEbooks
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Download an authentic E-Book file directly (PDF or EPUB)
// @route   GET /api/books/:id/download
// @access  Public
export const downloadEbook = async (req, res, next) => {
  try {
    const { id } = req.params;
    const format = (req.query.format || 'pdf').toLowerCase();

    const book = await Book.findById(id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'The requested E-Book was not found in the catalog.'
      });
    }

    // Clean filename for download
    const safeTitle = (book.title || 'ebook')
      .replace(/[^a-zA-Z0-9_\- ]/g, '')
      .trim()
      .replace(/\s+/g, '_');

    if (format === 'epub') {
      const epubBuffer = generateBookEPUB(book);
      res.setHeader('Content-Type', 'application/epub+zip');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.epub"`);
      res.setHeader('Content-Length', epubBuffer.length);
      return res.send(epubBuffer);
    } else {
      const pdfBuffer = generateBookPDF(book);
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${safeTitle}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);
      return res.send(pdfBuffer);
    }
  } catch (err) {
    next(err);
  }
};

