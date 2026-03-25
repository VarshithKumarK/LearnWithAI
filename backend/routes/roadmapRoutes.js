import express from 'express';
import { generateRoadmap, getRoadmaps, updateRoadmapProgress } from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, generateRoadmap)
  .get(protect, getRoadmaps);

router.route('/:id/progress')
  .put(protect, updateRoadmapProgress);

export default router;
