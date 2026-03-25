import express from 'express';
import { sendConnectionRequest, getConnections } from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, sendConnectionRequest)
  .get(protect, getConnections);

export default router;
