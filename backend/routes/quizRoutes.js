import express from 'express';
import { generateQuiz, revealAnswer, revealAllAnswers } from '../controllers/quizController.js';

const router = express.Router();

router.post('/generate', generateQuiz);
router.post('/reveal', revealAnswer);
router.post('/reveal-all', revealAllAnswers);

export default router;
