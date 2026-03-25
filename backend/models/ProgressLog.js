import mongoose from 'mongoose';

const progressLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    milestoneId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
    score: {
      type: Number,
      default: 0,
    },
    completed: {
      type: Boolean,
      default: false,
    },
    timeSpent: {
      type: Number, // In minutes
      default: 0,
    },
  },
  { timestamps: true }
);

const ProgressLog = mongoose.model('ProgressLog', progressLogSchema);
export default ProgressLog;
