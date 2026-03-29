import express from 'express';
import { getUserProfile, updateStreak, uploadProfilePic, updateUserProfile, searchUsers, getUserById } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { upload } from '../config/cloudinary.js';

const router = express.Router();

// Social Discovery
router.get('/search', protect, searchUsers);

// User profile (own)
router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put('/streak', protect, updateStreak);
router.put('/profile-pic', protect, upload.single('image'), uploadProfilePic);

// Public user profile by ID (must be after /search and /profile)
router.get('/:id', protect, getUserById);

export default router;
