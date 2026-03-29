import express from 'express';
import { recommendResources, saveResource, getSavedResources, deleteResource } from '../controllers/resourceController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/recommend')
  .post(protect, recommendResources);

router.route('/save').post(protect, saveResource);
router.route('/saved').get(protect, getSavedResources);
router.route('/:id').delete(protect, deleteResource);

export default router;
