import { generateQuizFromAI, revealQuizAnswer, revealAllQuizAnswers } from '../services/mlService.js';

export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, num_questions } = req.body;
    console.log('[NODE BACKEND -> generateQuiz] Received request:', req.body);
    
    // Call AI Service
    const quizData = await generateQuizFromAI(topic, difficulty, num_questions);

    console.log(`[NODE BACKEND -> generateQuiz] Sending generated quiz ${quizData.quiz_id} back to frontend`);
    res.status(201).json(quizData);
  } catch (error) {
    console.error('Generate Quiz Error:', error);
    res.status(500).json({ message: 'Server error generating quiz' });
  }
};

export const revealAnswer = async (req, res) => {
  try {
    const { quiz_id, question_id } = req.body;
    console.log(`[NODE BACKEND -> revealAnswer] Request for quiz ${quiz_id}, question ${question_id}`);
    
    const ans = await revealQuizAnswer(quiz_id, question_id);
    res.json(ans);
  } catch (error) {
    console.error('Reveal Answer Error:', error);
    res.status(500).json({ message: 'Server error revealing answer' });
  }
};

export const revealAllAnswers = async (req, res) => {
  try {
    const { quiz_id } = req.body;
    console.log(`[NODE BACKEND -> revealAllAnswers] Request for quiz ${quiz_id}`);
    
    const ans = await revealAllQuizAnswers(quiz_id);
    res.json(ans);
  } catch (error) {
    console.error('Reveal All Answers Error:', error);
    res.status(500).json({ message: 'Server error revealing all answers' });
  }
};
