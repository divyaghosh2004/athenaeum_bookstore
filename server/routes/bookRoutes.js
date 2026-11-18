import express from 'express';
import {
  getBooks,
  getHomeSections,
  getBookById,
  getCategories,
  getFreeBooks
} from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/sections', getHomeSections);
router.get('/categories', getCategories);
router.get('/free', getFreeBooks);
router.get('/:id', getBookById);

export default router;

