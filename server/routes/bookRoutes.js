import express from 'express';
import {
  getBooks,
  getHomeSections,
  getBookById,
  getCategories,
  getFreeBooks,
  getEbooks,
  downloadEbook
} from '../controllers/bookController.js';

const router = express.Router();

router.get('/', getBooks);
router.get('/sections', getHomeSections);
router.get('/categories', getCategories);
router.get('/free', getFreeBooks);
router.get('/ebooks', getEbooks);
router.get('/:id/download', downloadEbook);
router.get('/:id', getBookById);

export default router;

