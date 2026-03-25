import express from 'express';
import { getUserProfile, updateStreak, uploadProfilePic, updateUserProfile } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/streak', protect, updateStreak);
router.put('/profile-pic', protect, upload.single('image'), uploadProfilePic);

export default router;
