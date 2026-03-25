import mongoose from 'mongoose';

const learningPathSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    goal: {
      type: String,
      required: true,
    },
    milestones: [
      {
        title: { type: String, required: true },
        description: { type: String },
        completed: { type: Boolean, default: false },
      },
    ],
    progress: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

const LearningPath = mongoose.model('LearningPath', learningPathSchema);
export default LearningPath;
