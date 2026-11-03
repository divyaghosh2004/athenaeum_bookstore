import express from 'express';
import { getProfile, updateProfile, changePassword } from '../controllers/userController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';

const router = express.Router();

router.use(protect); // All user profile routes are protected

router.get('/profile', getProfile);
router.put('/profile', upload.single('profilePicture'), updateProfile);
router.put('/change-password', changePassword);

export default router;

