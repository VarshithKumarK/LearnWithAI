import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { predictCourseCompletion } from '../controllers/predictionController.js';

const router = express.Router();

router.post('/course-completion', protect, predictCourseCompletion);

export default router;
