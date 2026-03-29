import express from 'express';
import { sendConnectionRequest, getConnections, acceptConnection, rejectConnection } from '../controllers/connectionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.route('/')
  .post(protect, sendConnectionRequest)
  .get(protect, getConnections);

router.put('/:id/accept', protect, acceptConnection);
router.put('/:id/reject', protect, rejectConnection);

export default router;
