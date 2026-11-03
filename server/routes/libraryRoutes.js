import express from 'express';
import { getLibrary, updateProgress, claimFreeBook } from '../controllers/libraryController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect); // All library routes require authentication

router.get('/', getLibrary);
router.put('/:bookId/progress', updateProgress);
router.post('/claim/:bookId', claimFreeBook);

export default router;

