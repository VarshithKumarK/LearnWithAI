import { generateQuizFromAI, revealQuizAnswer, revealAllQuizAnswers } from '../services/mlService.js';
import Quiz from '../models/Quiz.js';
import { updateUserStreak } from '../services/streakService.js';

export const generateQuiz = async (req, res) => {
  try {
    const { topic, difficulty, num_questions } = req.body;
    console.log('[NODE BACKEND -> generateQuiz] Received request:', req.body);
    
    // Call AI Service
    const quizData = await generateQuizFromAI(topic, difficulty, num_questions);

    console.log(`[NODE BACKEND -> generateQuiz] Sending generated quiz ${quizData.quiz_id} back to frontend`);
    
    // Update streak (fire-and-forget)
    updateUserStreak(req.user._id).catch(() => {});
    
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

export const saveQuiz = async (req, res) => {
  try {
    const { topic, score, totalQuestions, questions } = req.body;
    const quiz = await Quiz.create({
      userId: req.user._id,
      topic,
      score,
      totalQuestions,
      questions
    });
    res.status(201).json(quiz);
  } catch (error) {
    console.error('Save Quiz Error:', error);
    res.status(500).json({ message: 'Server error saving quiz' });
  }
};

export const getSavedQuizzes = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json(quizzes);
  } catch (error) {
    console.error('Get Saved Quizzes Error:', error);
    res.status(500).json({ message: 'Server error fetching saved quizzes' });
  }
};

export const deleteQuiz = async (req, res) => {
  try {
    const deletedQuiz = await Quiz.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
    if (!deletedQuiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    res.json({ message: 'Quiz deleted' });
  } catch (error) {
    console.error('Delete Quiz Error:', error);
    res.status(500).json({ message: 'Server error deleting quiz' });
  }
};
