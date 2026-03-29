import mongoose from 'mongoose';

const quizSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    questions: [
      {
        question: { type: String, required: true },
        options: [{ type: String, required: true }],
        userAnswer: { type: String },
        correctAnswer: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

const Quiz = mongoose.model('Quiz', quizSchema);
export default Quiz;
