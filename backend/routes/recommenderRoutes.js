import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { getCourses, recommendCourses } from '../controllers/recommenderController.js';

const router = express.Router();

router.get('/courses', protect, getCourses);
router.post('/recommend', protect, recommendCourses);

export default router;
