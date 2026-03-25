import express from 'express';
import { recommendResources } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/recommend')
  .post(protect, recommendResources);

export default router;
