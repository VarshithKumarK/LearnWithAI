import express from 'express';
import { generateDraftRoadmap, saveRoadmap, getRoadmaps, updateRoadmapProgress, deleteRoadmap } from '../controllers/roadmapController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, saveRoadmap)
  .get(protect, getRoadmaps);

router.post('/generate', protect, generateDraftRoadmap);

router.route('/:id/progress')
  .put(protect, updateRoadmapProgress);

router.route('/:id')
  .delete(protect, deleteRoadmap);

export default router;
