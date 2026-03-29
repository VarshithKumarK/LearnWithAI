import express from 'express';
import { protect } from '../middleware/authMiddleware.js';
import { generateQuiz, revealAnswer, revealAllAnswers, saveQuiz, getSavedQuizzes, deleteQuiz } from '../controllers/quizController.js';

const router = express.Router();

router.post('/generate', generateQuiz);
router.post('/reveal', revealAnswer);
router.post('/reveal-all', revealAllAnswers);

router.post('/save', protect, saveQuiz);
router.get('/saved', protect, getSavedQuizzes);
router.delete('/:id', protect, deleteQuiz);

export default router;
